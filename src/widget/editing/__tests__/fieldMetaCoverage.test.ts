import { describe, it, expect } from "vitest";
import { FIELD_META } from "../fieldMeta.js";
import { TAB_CONFIG } from "../tabConfig.js";

describe("Field Meta Coverage (WGT-002 drift guards)", () => {
  it("every meta entry has non-empty label", () => {
    for (const f of FIELD_META) {
      expect(f.label.length, `${f.key} missing label`).toBeGreaterThan(0);
    }
  });

  it("every meta entry has non-empty simpleDefinition", () => {
    for (const f of FIELD_META) {
      expect(
        f.simpleDefinition.length,
        `${f.key} missing simpleDefinition`
      ).toBeGreaterThan(0);
    }
  });

  it("every meta entry has non-empty impact", () => {
    for (const f of FIELD_META) {
      expect(f.impact.length, `${f.key} missing impact`).toBeGreaterThan(0);
    }
  });

  it("every meta entry has non-empty formula", () => {
    for (const f of FIELD_META) {
      expect(f.formula.length, `${f.key} missing formula`).toBeGreaterThan(0);
    }
  });

  it("every kiosk field with static anchors has exactly 4", () => {
    const kioskWithStaticAnchors = FIELD_META.filter(
      (f) => f.control === "kiosk" && f.anchors != null
    );
    for (const f of kioskWithStaticAnchors) {
      expect(f.anchors!.length, `${f.key} should have 4 anchors`).toBe(4);
    }
  });

  it("every kiosk field has either static anchors or dynamicPercentAnchors", () => {
    const kioskFields = FIELD_META.filter((f) => f.control === "kiosk");
    for (const f of kioskFields) {
      const hasAnchors = f.anchors != null || f.dynamicPercentAnchors != null;
      expect(hasAnchors, `${f.key} kiosk must have anchors`).toBe(true);
    }
  });

  it("no duplicate keys in fieldMeta", () => {
    const keys = FIELD_META.map((f) => f.key);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });

  it("every fieldKey in tabConfig exists in fieldMeta", () => {
    const metaKeys = new Set(FIELD_META.map((f) => f.key));
    const tabKeys = TAB_CONFIG.flatMap((t) =>
      t.sections.flatMap((s) => s.fieldKeys)
    );
    for (const k of tabKeys) {
      expect(metaKeys.has(k), `tabConfig references unknown field: ${k}`).toBe(
        true
      );
    }
  });

  it("every fieldMeta key is referenced in tabConfig", () => {
    const tabKeys = new Set(
      TAB_CONFIG.flatMap((t) => t.sections.flatMap((s) => s.fieldKeys))
    );
    for (const f of FIELD_META) {
      expect(
        tabKeys.has(f.key),
        `fieldMeta key ${f.key} not in any tab`
      ).toBe(true);
    }
  });

  it("no duplicate fieldKeys across tabConfig sections", () => {
    const allKeys = TAB_CONFIG.flatMap((t) =>
      t.sections.flatMap((s) => s.fieldKeys)
    );
    const unique = new Set(allKeys);
    expect(unique.size).toBe(allKeys.length);
  });

  it("fieldMeta has exactly 19 entries (18 fields + 1 disclosure)", () => {
    expect(FIELD_META.length).toBe(19);
  });

  it("tabConfig has exactly 5 tabs", () => {
    expect(TAB_CONFIG.length).toBe(5);
  });
});
