import { describe, it, expect } from "vitest";
import {
  WORKSPACE_ROLES,
  ROLE_LABELS,
  roleAtLeast,
  type WorkspaceRole,
} from "@/lib/constants";

describe("rbac: roleAtLeast ordering", () => {
  it("every role meets its own threshold (reflexive)", () => {
    for (const role of WORKSPACE_ROLES) {
      expect(roleAtLeast(role, role)).toBe(true);
    }
  });

  it("owner >= admin >= marketer >= analyst >= viewer (downward holds)", () => {
    expect(roleAtLeast("owner", "admin")).toBe(true);
    expect(roleAtLeast("owner", "marketer")).toBe(true);
    expect(roleAtLeast("owner", "analyst")).toBe(true);
    expect(roleAtLeast("owner", "viewer")).toBe(true);

    expect(roleAtLeast("admin", "marketer")).toBe(true);
    expect(roleAtLeast("admin", "analyst")).toBe(true);
    expect(roleAtLeast("admin", "viewer")).toBe(true);

    expect(roleAtLeast("marketer", "analyst")).toBe(true);
    expect(roleAtLeast("marketer", "viewer")).toBe(true);

    expect(roleAtLeast("analyst", "viewer")).toBe(true);
  });

  it("a lower role does NOT meet a higher threshold (upward fails)", () => {
    expect(roleAtLeast("viewer", "marketer")).toBe(false);
    expect(roleAtLeast("viewer", "analyst")).toBe(false);
    expect(roleAtLeast("viewer", "admin")).toBe(false);
    expect(roleAtLeast("viewer", "owner")).toBe(false);

    expect(roleAtLeast("analyst", "marketer")).toBe(false);
    expect(roleAtLeast("analyst", "admin")).toBe(false);

    expect(roleAtLeast("marketer", "admin")).toBe(false);
    expect(roleAtLeast("marketer", "owner")).toBe(false);

    expect(roleAtLeast("admin", "owner")).toBe(false);
  });

  it("is consistent with the declared WORKSPACE_ROLES order (most → least privileged)", () => {
    // Each role outranks (>=) every role that appears after it, and is not
    // outranked-or-equal by ranks strictly below for the strict cases above.
    for (let i = 0; i < WORKSPACE_ROLES.length; i++) {
      for (let j = i; j < WORKSPACE_ROLES.length; j++) {
        const higher = WORKSPACE_ROLES[i];
        const lower = WORKSPACE_ROLES[j];
        expect(roleAtLeast(higher, lower)).toBe(true);
        if (i !== j) {
          // Strictly lower role cannot satisfy the higher threshold.
          expect(roleAtLeast(lower, higher)).toBe(false);
        }
      }
    }
  });
});

describe("rbac: ROLE_LABELS coverage", () => {
  it("has a non-empty label for every WORKSPACE_ROLES entry", () => {
    for (const role of WORKSPACE_ROLES) {
      const label = ROLE_LABELS[role as WorkspaceRole];
      expect(typeof label).toBe("string");
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it("does not define labels for roles outside WORKSPACE_ROLES", () => {
    const labelKeys = Object.keys(ROLE_LABELS).sort();
    const roleKeys = [...WORKSPACE_ROLES].sort();
    expect(labelKeys).toEqual(roleKeys);
  });

  it("maps each role to its expected human label", () => {
    expect(ROLE_LABELS.owner).toBe("Owner");
    expect(ROLE_LABELS.admin).toBe("Admin");
    expect(ROLE_LABELS.marketer).toBe("Marketer");
    expect(ROLE_LABELS.analyst).toBe("Analyst");
    expect(ROLE_LABELS.viewer).toBe("Viewer");
  });
});
