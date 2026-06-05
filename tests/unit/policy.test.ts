import { describe, it, expect } from "vitest";

import {
  evaluateBudgetChange,
  hasMinimumData,
  validateRecommendation,
  isActionBlockedByEmergencyStop,
} from "@/lib/policy/engine";
import { SAFETY_LIMITS } from "@/lib/constants";

/**
 * Policy engine: the safety rails that guard every automated change.
 *
 * The exact return shape of the engine is allowed to evolve, so these tests
 * probe the *documented behaviour* through tolerant predicates rather than
 * asserting one rigid object literal. Each predicate accepts the field names a
 * reasonable implementation is likely to use, while still proving the rule.
 */

type Result = Record<string, unknown>;

/** True when the engine clearly signals the change may proceed as requested. */
function isAllowed(result: unknown): boolean {
  const r = result as Result;
  if (typeof r?.allowed === "boolean") return r.allowed;
  if (typeof r?.approved === "boolean") return r.approved;
  if (typeof r?.rejected === "boolean") return !r.rejected;
  if (typeof r?.ok === "boolean") return r.ok;
  if (typeof r?.status === "string") {
    return r.status === "allowed" || r.status === "approved" || r.status === "ok";
  }
  // If nothing explicitly denies it, fall back to "not blocked".
  return !isRejected(result) && !requiresApproval(result);
}

/** True when the engine refuses the change outright. */
function isRejected(result: unknown): boolean {
  const r = result as Result;
  if (typeof r?.rejected === "boolean") return r.rejected;
  if (typeof r?.allowed === "boolean") return r.allowed === false;
  if (typeof r?.approved === "boolean" && typeof r?.requiresApproval !== "boolean") {
    return r.approved === false;
  }
  if (typeof r?.ok === "boolean") return r.ok === false;
  if (typeof r?.blocked === "boolean") return r.blocked;
  if (typeof r?.status === "string") {
    return r.status === "rejected" || r.status === "denied" || r.status === "blocked";
  }
  return false;
}

/** True when the engine says a human must approve before the change applies. */
function requiresApproval(result: unknown): boolean {
  const r = result as Result;
  if (typeof r?.requiresApproval === "boolean") return r.requiresApproval;
  if (typeof r?.needsApproval === "boolean") return r.needsApproval;
  if (typeof r?.approvalRequired === "boolean") return r.approvalRequired;
  if (typeof r?.status === "string") {
    return r.status === "requires_approval" || r.status === "needs_approval";
  }
  return false;
}

/** True when the engine altered the requested amount to fit within limits. */
function isClampedOrFlagged(result: unknown): boolean {
  const r = result as Result;
  if (typeof r?.clamped === "boolean" && r.clamped) return true;
  if (typeof r?.flagged === "boolean" && r.flagged) return true;
  if (typeof r?.capped === "boolean" && r.capped) return true;
  if (typeof r?.adjusted === "boolean" && r.adjusted) return true;
  if (
    typeof r?.clampedAmount === "number" ||
    typeof r?.allowedAmount === "number" ||
    typeof r?.cappedAmount === "number" ||
    typeof r?.maxAllowed === "number"
  ) {
    return true;
  }
  return false;
}

describe("evaluateBudgetChange", () => {
  const maxIncreasePct = SAFETY_LIMITS.maxBudgetIncreasePct; // 0.2

  it("does not freely allow an increase larger than the max increase percentage", () => {
    // +50% jump, well above the 20% cap, with plenty of headroom on daily spend.
    const currentDailyBudget = 100;
    const requestedDailyBudget = currentDailyBudget * (1 + maxIncreasePct + 0.3);

    const result = evaluateBudgetChange({
      currentDailyBudget,
      requestedDailyBudget,
      workspaceMaxDailySpend: 10_000,
      autoApprovedRule: false,
    });

    // An oversized increase must NOT silently sail through: it is either
    // rejected, held for approval, or clamped/flagged down to the cap.
    const okToProceedSilently =
      isAllowed(result) &&
      !requiresApproval(result) &&
      !isRejected(result) &&
      !isClampedOrFlagged(result);

    expect(okToProceedSilently).toBe(false);
  });

  it("rejects an increase that would exceed the workspace max daily spend", () => {
    // Even a within-cap percentage step is refused when it breaches the ceiling.
    const workspaceMaxDailySpend = 500;
    const currentDailyBudget = 480;
    const requestedDailyBudget = 600; // over the 500 ceiling

    const result = evaluateBudgetChange({
      currentDailyBudget,
      requestedDailyBudget,
      workspaceMaxDailySpend,
      autoApprovedRule: false,
    });

    // Breaching the hard spend ceiling is never auto-allowed.
    expect(isAllowed(result) && !requiresApproval(result) && !isClampedOrFlagged(result)).toBe(
      false,
    );
    expect(isRejected(result) || requiresApproval(result) || isClampedOrFlagged(result)).toBe(
      true,
    );
  });

  it("allows a budget decrease", () => {
    const result = evaluateBudgetChange({
      currentDailyBudget: 200,
      requestedDailyBudget: 120, // a reduction is always safe
      workspaceMaxDailySpend: 10_000,
      autoApprovedRule: false,
    });

    expect(isRejected(result)).toBe(false);
    expect(isAllowed(result)).toBe(true);
  });

  it("auto-approves a small increase under an auto-approved rule within limits", () => {
    // +10%: under the 20% cap and far below the daily ceiling.
    const currentDailyBudget = 100;
    const requestedDailyBudget = 110;

    const result = evaluateBudgetChange({
      currentDailyBudget,
      requestedDailyBudget,
      workspaceMaxDailySpend: 10_000,
      autoApprovedRule: true,
    });

    expect(requiresApproval(result)).toBe(false);
    expect(isRejected(result)).toBe(false);
    expect(isAllowed(result)).toBe(true);
  });
});

describe("hasMinimumData", () => {
  const minSpend = SAFETY_LIMITS.minSpendForPauseDecision; // 25
  const minImpressions = SAFETY_LIMITS.minImpressionsForDecision; // 1000
  const minConversions = SAFETY_LIMITS.minConversionsForRoasDecision; // 5

  it("requires spend >= 25 and impressions >= 1000 to pause", () => {
    expect(
      hasMinimumData("pause", { spend: minSpend, impressions: minImpressions }).met,
    ).toBe(true);

    // Below either threshold => not enough data.
    expect(
      hasMinimumData("pause", { spend: minSpend - 1, impressions: minImpressions }).met,
    ).toBe(false);
    expect(
      hasMinimumData("pause", { spend: minSpend, impressions: minImpressions - 1 }).met,
    ).toBe(false);
  });

  it("requires conversions >= 5 (in addition to spend & impressions) for a roas decision", () => {
    // Enough spend + impressions but too few conversions is insufficient for ROAS.
    expect(
      hasMinimumData("roas", {
        spend: minSpend,
        impressions: minImpressions,
        conversions: minConversions - 1,
      }).met,
    ).toBe(false);

    // All three thresholds met => sufficient.
    expect(
      hasMinimumData("roas", {
        spend: minSpend,
        impressions: minImpressions,
        conversions: minConversions,
      }).met,
    ).toBe(true);
  });

  it("treats the roas threshold as stricter than the pause threshold", () => {
    // Data that is fine to pause on can still be too thin for a ROAS call,
    // because ROAS additionally needs conversions.
    const data = { spend: minSpend, impressions: minImpressions, conversions: 0 };
    expect(hasMinimumData("pause", data).met).toBe(true);
    expect(hasMinimumData("roas", data).met).toBe(false);
  });
});

describe("validateRecommendation", () => {
  it("flags a pause_ad recommendation that lacks minimum data", () => {
    const result = validateRecommendation({
      type: "pause_ad",
      reason: "Spending without results",
      supportingMetrics: { spend: 5, impressions: 50, conversions: 0 }, // far below thresholds
    });

    // Insufficient data => not allowed to run unattended; minimum-data not met.
    expect(isAllowed(result) && !requiresApproval(result)).toBe(false);
  });

  it("requires approval for a well-supported pause recommendation with no budget change", () => {
    const result = validateRecommendation({
      type: "pause_ad",
      reason: "Consistently below target ROAS with sufficient data",
      supportingMetrics: {
        spend: SAFETY_LIMITS.minSpendForPauseDecision + 50,
        impressions: SAFETY_LIMITS.minImpressionsForDecision + 2_000,
        conversions: SAFETY_LIMITS.minConversionsForRoasDecision + 3,
      },
      // no budgetChange field => not a budget action, but still needs a human.
    });

    expect(requiresApproval(result)).toBe(true);
    expect(isRejected(result)).toBe(false);
  });
});

describe("isActionBlockedByEmergencyStop", () => {
  it("blocks all actions when the emergency stop is active", () => {
    expect(isActionBlockedByEmergencyStop(true)).toBe(true);
  });

  it("does not block actions when the emergency stop is inactive", () => {
    expect(isActionBlockedByEmergencyStop(false)).toBe(false);
  });
});
