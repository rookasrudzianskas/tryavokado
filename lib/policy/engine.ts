/**
 * Deterministic safety / policy engine.
 *
 * This module is the trust boundary between the LLM and any integration that can
 * mutate real ad accounts. The model NEVER executes mutations directly — it emits
 * structured `RecommendationLike` proposals, this engine validates them against
 * hard safety rails (and the workspace's own limits), and only then does a human
 * approve. Every function here is pure and deterministic: no IO, no clock, no
 * randomness, no `server-only` imports. That keeps it exhaustively unit-testable
 * and identical on the client, the server, and inside a background job.
 *
 * Invariant: a denied or approval-gated decision can only ever become *more*
 * permissive through explicit human approval — never through model output alone.
 */

import { SAFETY_LIMITS } from "@/lib/constants";
import { ValidationError } from "@/lib/errors";

/**
 * The result of evaluating any proposed action.
 *
 * - `allowed`      — whether the action is permissible AT ALL. If `false`, it must
 *                    never execute, regardless of approval.
 * - `reasons`      — human-readable, ordered explanations (both for blocks and for
 *                    notable allowances such as a clamp). Always non-empty so the UI
 *                    and audit log have something to show.
 * - `requiresApproval` — whether a human must explicitly approve before execution.
 *                    Only meaningful when `allowed` is `true`.
 * - `adjustedValue` — present when the engine clamped a requested value to a safe
 *                    one (e.g. a budget reduced to fit a limit). Callers should use
 *                    this value instead of the originally requested one.
 */
export type PolicyDecision = {
  allowed: boolean;
  reasons: string[];
  requiresApproval: boolean;
  adjustedValue?: number;
};

/** A proposed change to a single ad set / campaign daily budget. */
export interface BudgetChangeRequest {
  /** The budget currently in effect, in account currency major units. */
  currentDailyBudget: number;
  /** The budget the recommendation wants to set, in account currency major units. */
  requestedDailyBudget: number;
  /**
   * Hard per-day spend ceiling configured for the workspace. Defaults to
   * `SAFETY_LIMITS.defaultMaxDailySpend` when not provided.
   */
  workspaceMaxDailySpend?: number;
  /** Optional hard monthly spend ceiling for the workspace, in major units. */
  workspaceMonthlyLimit?: number;
  /**
   * Optional projection of the month's total spend if the requested budget were
   * applied. Used to enforce `workspaceMonthlyLimit`. When omitted, the monthly
   * limit is approximated from the requested daily budget (see implementation).
   */
  projectedMonthlySpend?: number;
  /**
   * True when this change is covered by a workspace automation rule the user has
   * pre-approved. Lets an in-bounds change skip the manual approval gate.
   */
  autoApprovedRule?: boolean;
}

/** Raw performance signals backing a recommendation. */
export interface MinimumDataInput {
  /** Amount spent so far on the entity, in major units. */
  spend: number;
  /** Impressions accrued so far. */
  impressions: number;
  /** Conversions attributed so far. Only required for the `roas` gate. */
  conversions?: number;
}

/** The kinds of statistical-confidence gates the engine knows about. */
export type MinimumDataKind = "pause" | "roas" | "general";

/**
 * A model-proposed recommendation, in the loose shape the engine needs to judge
 * it. The real recommendation object may carry far more; only these fields matter
 * to the safety engine.
 */
export interface RecommendationLike {
  /**
   * Machine type of the recommendation, e.g. `"pause_adset"`,
   * `"increase_budget"`, `"decrease_budget"`, `"roas_optimization"`,
   * `"creative_refresh"`. Matching is done by substring (see helpers below) so
   * new but conventionally-named types are classified sensibly.
   */
  type: string;
  /** Human-readable rationale (carried through; not interpreted by the engine). */
  reason?: string;
  /**
   * Caller's hint that approval is required. The engine treats this as a floor:
   * if the caller says approval is required, the engine never downgrades it.
   */
  requiresApproval?: boolean;
  /** Performance signals supporting the recommendation, if any. */
  supportingMetrics?: {
    spend?: number;
    impressions?: number;
    conversions?: number;
  };
  /** Present when the recommendation also changes a budget. */
  budgetChange?: BudgetChangeRequest;
}

/* -------------------------------------------------------------------------- */
/* Internal helpers                                                           */
/* -------------------------------------------------------------------------- */

/** Round currency to whole cents to avoid float dust leaking into decisions. */
function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Guard a number that participates in a safety decision. Anything non-finite or
 * (where disallowed) negative would silently corrupt a comparison, so we fail
 * loudly with a `ValidationError` rather than emit an unsafe `allowed: true`.
 */
function assertSafeNumber(
  value: number,
  field: string,
  { allowNegative = false }: { allowNegative?: boolean } = {},
): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ValidationError(`"${field}" must be a finite number.`, { field, value });
  }
  if (!allowNegative && value < 0) {
    throw new ValidationError(`"${field}" must not be negative.`, { field, value });
  }
}

/** Format a currency amount for use inside a human-readable reason string. */
function money(value: number): string {
  return roundCents(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/** Classify a recommendation type into the data-confidence gate it must clear. */
function dataKindForType(type: string): MinimumDataKind {
  const t = type.toLowerCase();
  if (t.startsWith("pause") || t.includes("pause")) return "pause";
  if (t.includes("roas") || t.includes("increase_budget")) return "roas";
  return "general";
}

/**
 * Types that move money or are otherwise destructive. These ALWAYS require human
 * approval unless a pre-approved automation rule explicitly covers them.
 */
function isSpendAffectingOrDestructive(type: string): boolean {
  const t = type.toLowerCase();
  return (
    t.includes("pause") ||
    t.includes("budget") ||
    t.includes("spend") ||
    t.includes("bid") ||
    t.includes("delete") ||
    t.includes("archive") ||
    t.includes("stop") ||
    t.includes("activate") ||
    t.includes("resume") ||
    t.includes("launch") ||
    t.includes("publish")
  );
}

/* -------------------------------------------------------------------------- */
/* Minimum-data confidence gate                                               */
/* -------------------------------------------------------------------------- */

/**
 * Decide whether there is enough observed data to act on a recommendation of the
 * given `kind`. Acting on noise (e.g. pausing an ad set after $3 of spend) is one
 * of the most common ways automated advertising tooling destroys value, so these
 * floors are non-negotiable safety rails, independent of any model confidence.
 *
 * Pure: depends only on its inputs.
 */
export function hasMinimumData(
  kind: MinimumDataKind,
  d: MinimumDataInput,
): { met: boolean; reasons: string[] } {
  const conversions = d.conversions ?? 0;
  assertSafeNumber(d.spend, "spend");
  assertSafeNumber(d.impressions, "impressions");
  assertSafeNumber(conversions, "conversions");

  const reasons: string[] = [];

  // `general` and `roas` both inherit the impressions floor; `pause` and `roas`
  // additionally require a spend floor; `roas` adds a conversions floor on top.
  const needsSpendFloor = kind === "pause" || kind === "roas";
  const needsConversionsFloor = kind === "roas";

  if (needsSpendFloor && d.spend < SAFETY_LIMITS.minSpendForPauseDecision) {
    reasons.push(
      `Not enough spend to decide: $${money(d.spend)} observed, but at least $${money(
        SAFETY_LIMITS.minSpendForPauseDecision,
      )} is required.`,
    );
  }

  if (d.impressions < SAFETY_LIMITS.minImpressionsForDecision) {
    reasons.push(
      `Not enough impressions to decide: ${d.impressions.toLocaleString(
        "en-US",
      )} observed, but at least ${SAFETY_LIMITS.minImpressionsForDecision.toLocaleString(
        "en-US",
      )} are required.`,
    );
  }

  if (needsConversionsFloor && conversions < SAFETY_LIMITS.minConversionsForRoasDecision) {
    reasons.push(
      `Not enough conversions for a reliable ROAS read: ${conversions.toLocaleString(
        "en-US",
      )} observed, but at least ${SAFETY_LIMITS.minConversionsForRoasDecision.toLocaleString(
        "en-US",
      )} are required.`,
    );
  }

  const met = reasons.length === 0;
  if (met) {
    reasons.push("Sufficient data to support this decision.");
  }
  return { met, reasons };
}

/* -------------------------------------------------------------------------- */
/* Budget-change evaluation                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Evaluate a proposed budget change against the hard safety rails and the
 * workspace's own ceilings.
 *
 * Rules, in order:
 *  1. Decreases (and no-ops) are always permitted — lowering spend is never unsafe.
 *  2. An increase may raise the budget by at most `maxBudgetIncreasePct` (20%) in a
 *     single action. A larger increase is CLAMPED down to the 20% cap (with an
 *     explanation) rather than rejected outright, so the system still makes safe
 *     forward progress.
 *  3. The effective (possibly clamped) budget may never exceed
 *     `workspaceMaxDailySpend`. If even the clamped value would exceed it, the
 *     budget is further clamped to the ceiling; if the ceiling is at or below the
 *     current budget there is no headroom and the increase is rejected.
 *  4. The effective budget may never push projected monthly spend past
 *     `workspaceMonthlyLimit`; otherwise the change is rejected.
 *  5. `requiresApproval` is `true` for every change EXCEPT an in-bounds increase
 *     (or decrease) explicitly covered by `autoApprovedRule`.
 *
 * `adjustedValue` is set whenever the engine settled on a value different from the
 * request; callers must apply `adjustedValue` rather than `requestedDailyBudget`.
 *
 * Pure: depends only on its inputs and the static `SAFETY_LIMITS`.
 */
export function evaluateBudgetChange(req: BudgetChangeRequest): PolicyDecision {
  assertSafeNumber(req.currentDailyBudget, "currentDailyBudget");
  assertSafeNumber(req.requestedDailyBudget, "requestedDailyBudget");

  const maxDailySpend = req.workspaceMaxDailySpend ?? SAFETY_LIMITS.defaultMaxDailySpend;
  assertSafeNumber(maxDailySpend, "workspaceMaxDailySpend");

  if (req.workspaceMonthlyLimit !== undefined) {
    assertSafeNumber(req.workspaceMonthlyLimit, "workspaceMonthlyLimit");
  }
  if (req.projectedMonthlySpend !== undefined) {
    assertSafeNumber(req.projectedMonthlySpend, "projectedMonthlySpend");
  }

  const current = roundCents(req.currentDailyBudget);
  const requested = roundCents(req.requestedDailyBudget);
  const reasons: string[] = [];

  /* ---- 1. Decrease or no-op: always allowed. ---------------------------- */
  if (requested <= current) {
    // Even a decrease must respect the daily ceiling conceptually, but since
    // requested <= current and a decrease only lowers spend, the only ceiling
    // worth flagging is an already-over-ceiling current budget being lowered —
    // which is still strictly safer, so we permit it.
    if (requested === current) {
      reasons.push("Budget is unchanged.");
    } else {
      reasons.push(
        `Budget decrease from $${money(current)} to $${money(requested)} is always permitted.`,
      );
    }

    const requiresApproval = !req.autoApprovedRule;
    if (req.autoApprovedRule) {
      reasons.push("Covered by a pre-approved automation rule.");
    }
    return { allowed: true, reasons, requiresApproval };
  }

  /* ---- 2. Increase: clamp to the per-action 20% cap. -------------------- */
  // When the current budget is 0 (e.g. resuming a paused entity), a percentage
  // cap has no meaning, so the daily-spend ceiling below is the only guard.
  let effective = requested;

  if (current > 0) {
    const maxByPct = roundCents(current * (1 + SAFETY_LIMITS.maxBudgetIncreasePct));
    if (requested > maxByPct) {
      reasons.push(
        `Requested increase from $${money(current)} to $${money(requested)} exceeds the ` +
          `${Math.round(SAFETY_LIMITS.maxBudgetIncreasePct * 100)}% per-action cap; ` +
          `clamped to $${money(maxByPct)}.`,
      );
      effective = maxByPct;
    }
  } else {
    reasons.push(
      `Current budget is $0, so the per-action percentage cap does not apply; ` +
        `only the daily spend ceiling is enforced.`,
    );
  }

  /* ---- 3. Enforce the hard daily spend ceiling. ------------------------- */
  if (effective > maxDailySpend) {
    if (maxDailySpend <= current) {
      // No headroom at all: we cannot increase without breaching the ceiling,
      // and we must not silently lower below the current budget here (that would
      // be a different, unrequested action). Reject.
      reasons.push(
        `Cannot increase budget: the workspace daily spend ceiling of $${money(
          maxDailySpend,
        )} is at or below the current budget of $${money(current)}.`,
      );
      return { allowed: false, reasons, requiresApproval: true };
    }
    reasons.push(
      `Capped at the workspace daily spend ceiling of $${money(maxDailySpend)} ` +
        `(was $${money(effective)}).`,
    );
    effective = roundCents(maxDailySpend);
  }

  /* ---- 4. Enforce the hard monthly spend ceiling. ----------------------- */
  if (req.workspaceMonthlyLimit !== undefined) {
    // Prefer the caller's projection; otherwise approximate the month from the
    // effective daily budget (30-day month is the conventional Meta basis).
    const projected =
      req.projectedMonthlySpend !== undefined
        ? roundCents(req.projectedMonthlySpend)
        : roundCents(effective * 30);

    if (projected > req.workspaceMonthlyLimit) {
      reasons.push(
        `Cannot apply: projected monthly spend of $${money(projected)} would exceed the ` +
          `workspace monthly limit of $${money(req.workspaceMonthlyLimit)}.`,
      );
      return { allowed: false, reasons, requiresApproval: true };
    }
  }

  /* ---- 5. Allowed. Decide approval & report any adjustment. ------------- */
  const clamped = effective !== requested;
  const decision: PolicyDecision = {
    allowed: true,
    reasons,
    // An increase always needs approval UNLESS a pre-approved rule covers it AND
    // the value was not clamped (a clamp means the request did not actually fit,
    // so a human should confirm the reduced value).
    requiresApproval: !(req.autoApprovedRule && !clamped),
  };

  if (clamped) {
    decision.adjustedValue = effective;
  } else {
    reasons.push(
      `Budget increase from $${money(current)} to $${money(effective)} is within all limits.`,
    );
  }

  if (req.autoApprovedRule && !clamped) {
    reasons.push("Covered by a pre-approved automation rule.");
  }

  return decision;
}

/* -------------------------------------------------------------------------- */
/* Recommendation validation (the public entry point)                         */
/* -------------------------------------------------------------------------- */

/**
 * Validate a full model-proposed recommendation. This is the function the rest of
 * the application calls before surfacing an action for approval or execution.
 *
 * It composes the lower-level rails:
 *  1. Runs the minimum-data gate appropriate to the recommendation's `type`
 *     (`pause_*` → pause, anything ROAS-related or `increase_budget` → roas, else
 *     general). Supporting metrics default to 0 when absent, which conservatively
 *     fails the data gate rather than passing on missing evidence.
 *  2. If a `budgetChange` is attached, folds in `evaluateBudgetChange` —
 *     propagating any clamp via `adjustedValue` and intersecting `allowed`.
 *  3. Forces `requiresApproval = true` for any spend-affecting or destructive
 *     type, unless an auto-approved rule on the budget change covers it (and that
 *     change itself did not require approval).
 *
 * The returned decision is the AND of every sub-check: `allowed` is true only if
 * every gate passed, and `requiresApproval` is true if any gate demands it.
 *
 * Pure: depends only on its inputs and the static `SAFETY_LIMITS`.
 */
export function validateRecommendation(rec: RecommendationLike): PolicyDecision {
  if (typeof rec.type !== "string" || rec.type.trim().length === 0) {
    throw new ValidationError("Recommendation must have a non-empty type.", {
      type: rec.type,
    });
  }

  const reasons: string[] = [];
  let allowed = true;
  // Caller's hint is a floor: never downgrade an explicitly requested approval.
  let requiresApproval = rec.requiresApproval === true;
  let adjustedValue: number | undefined;

  /* ---- 1. Minimum-data confidence gate. --------------------------------- */
  const kind = dataKindForType(rec.type);
  const metrics: MinimumDataInput = {
    spend: rec.supportingMetrics?.spend ?? 0,
    impressions: rec.supportingMetrics?.impressions ?? 0,
    conversions: rec.supportingMetrics?.conversions ?? 0,
  };
  const data = hasMinimumData(kind, metrics);
  if (!data.met) {
    allowed = false;
    for (const r of data.reasons) reasons.push(r);
  } else {
    reasons.push(`Data check (${kind}) passed.`);
  }

  /* ---- 2. Fold in any budget change. ------------------------------------ */
  if (rec.budgetChange) {
    const budget = evaluateBudgetChange(rec.budgetChange);
    for (const r of budget.reasons) reasons.push(r);
    allowed = allowed && budget.allowed;
    requiresApproval = requiresApproval || budget.requiresApproval;
    if (budget.adjustedValue !== undefined) {
      adjustedValue = budget.adjustedValue;
    }
  }

  /* ---- 3. Destructive / spend-affecting types always gate on approval. -- */
  if (isSpendAffectingOrDestructive(rec.type)) {
    // The only escape from the approval gate is a pre-approved automation rule on
    // the budget change that itself did not require approval.
    const coveredByAutoRule =
      rec.budgetChange?.autoApprovedRule === true &&
      evaluateBudgetChange(rec.budgetChange).requiresApproval === false;

    if (!coveredByAutoRule) {
      if (!requiresApproval) {
        reasons.push("This action affects spend or is destructive, so it requires approval.");
      }
      requiresApproval = true;
    }
  }

  const decision: PolicyDecision = { allowed, reasons, requiresApproval };
  if (adjustedValue !== undefined) {
    decision.adjustedValue = adjustedValue;
  }
  return decision;
}

/* -------------------------------------------------------------------------- */
/* Emergency stop                                                             */
/* -------------------------------------------------------------------------- */

/**
 * When a workspace's emergency stop is engaged, EVERY automated action is blocked
 * unconditionally — no exceptions, no auto-approved rules, no overrides. This
 * constant documents that contract for callers and tests.
 */
export const EMERGENCY_STOP_BLOCKS_ALL = true;

/**
 * Returns `true` when the emergency stop blocks the action. Because
 * `EMERGENCY_STOP_BLOCKS_ALL` is `true`, this is simply the stop's own state, but
 * it is expressed as a function so callers gate on intent (`isActionBlockedBy…`)
 * rather than reading a boolean directly, and so the policy can evolve in one place.
 */
export function isActionBlockedByEmergencyStop(emergencyStopActive: boolean): boolean {
  return EMERGENCY_STOP_BLOCKS_ALL && emergencyStopActive === true;
}
