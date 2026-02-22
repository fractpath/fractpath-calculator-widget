import { useState, useCallback, useMemo } from "react";
import type { DraftCanonicalInputs, FieldErrors, PreviewState } from "./types.js";
import type { DealResults } from "../packages/compute/src/index.js";
import { getDefaultDraftCanonicalInputs } from "./defaults.js";
import { deriveTier1Preview } from "./deriveTier1Preview.js";
import { validateDraft, hasErrors } from "./validateDraft.js";
import { previewCompute } from "./previewCompute.js";

type DraftPath =
  | `deal_terms.${keyof DraftCanonicalInputs["deal_terms"]}`
  | `scenario.${keyof DraftCanonicalInputs["scenario"]}`;

function setNestedField(
  draft: DraftCanonicalInputs,
  path: DraftPath,
  value: unknown
): DraftCanonicalInputs {
  const clone = structuredClone(draft);
  const [section, field] = path.split(".") as [
    "deal_terms" | "scenario",
    string,
  ];
  (clone[section] as unknown as Record<string, unknown>)[field] = value;
  return clone;
}

export function useDealDraftState(initial?: DraftCanonicalInputs) {
  const [draft, setDraft] = useState<DraftCanonicalInputs>(
    () => initial ?? getDefaultDraftCanonicalInputs()
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [preview, setPreview] = useState<PreviewState>(() => ({
    tier1: deriveTier1Preview(initial ?? getDefaultDraftCanonicalInputs()),
    status: "idle",
  }));

  const setField = useCallback((path: DraftPath, value: unknown) => {
    setDraft((prev) => {
      const next = setNestedField(prev, path, value);
      setPreview((p) => ({ ...p, tier1: deriveTier1Preview(next) }));
      return next;
    });
  }, []);

  const onBlurCompute = useCallback(() => {
    setDraft((current) => {
      const fieldErrors = validateDraft(current);
      setErrors(fieldErrors);

      if (hasErrors(fieldErrors)) {
        setPreview((p) => ({
          ...p,
          status: "error",
          error: "Validation failed",
        }));
        return current;
      }

      setPreview((p) => ({ ...p, status: "computing" }));

      try {
        const results: DealResults = previewCompute(current);
        setPreview({
          tier1: deriveTier1Preview(current),
          status: "ok",
          lastComputedAtIso: new Date().toISOString(),
          results,
        });
      } catch (err) {
        setPreview((p) => ({
          ...p,
          status: "error",
          error: err instanceof Error ? err.message : "Compute failed",
        }));
      }

      return current;
    });
  }, []);

  const tier1 = useMemo(() => deriveTier1Preview(draft), [draft]);

  return {
    draft,
    errors,
    preview: { ...preview, tier1 },
    setField,
    onBlurCompute,
  } as const;
}
