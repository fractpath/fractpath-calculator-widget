import { type ChangeEvent, type FocusEvent } from "react";
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
export declare function useNumericDraft(committed: number, onCommit: (n: number) => void, opts?: NumericDraftOptions): {
    displayValue: string;
    isInvalid: boolean;
    onFocus: (e: FocusEvent<HTMLInputElement>) => void;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
};
//# sourceMappingURL=useNumericDraft.d.ts.map