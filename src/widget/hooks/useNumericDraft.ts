import { useState, useCallback, type ChangeEvent, type FocusEvent } from "react";

export type NumericDraftOptions = {
  parse?: (s: string) => number;
  validate?: (n: number) => boolean;
  format?: (n: number) => string;
};

/**
 * Manages the display/edit lifecycle for a numeric input field.
 *
 * Pattern:
 * - `committed` (number) is the source of truth used for calculations.
 * - `draft` (string | null) holds the raw user-typed text while the field is focused.
 * - While draft is non-null, the input shows the draft string verbatim (allows empty, allows partial).
 * - On each onChange, if the draft parses to a valid number, onCommit is called immediately
 *   so calculations stay live for valid inputs.
 * - On blur, draft is cleared — the input returns to showing the formatted committed value.
 * - If the draft is empty or unparseable, `isInvalid` is true so an inline message can be shown.
 */
export function useNumericDraft(
  committed: number,
  onCommit: (n: number) => void,
  opts: NumericDraftOptions = {}
) {
  const {
    parse = (s: string) => parseFloat(s.replace(/,/g, "")),
    validate = () => true,
    format = (n: number) => n.toLocaleString(),
  } = opts;

  const [draft, setDraft] = useState<string | null>(null);

  const displayValue = draft !== null ? draft : format(committed);

  const isInvalid =
    draft !== null &&
    (draft.trim() === "" ||
      !Number.isFinite(parse(draft)) ||
      !validate(parse(draft)));

  const onFocus = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const el = e.currentTarget;
      setDraft(String(committed));
      setTimeout(() => el.select(), 0);
    },
    [committed]
  );

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDraft(raw);
      const parsed = parse(raw);
      if (raw.trim() !== "" && Number.isFinite(parsed) && validate(parsed)) {
        onCommit(parsed);
      }
    },
    [parse, validate, onCommit]
  );

  const onBlur = useCallback(() => {
    setDraft(null);
  }, []);

  return { displayValue, isInvalid, onFocus, onChange, onBlur };
}
