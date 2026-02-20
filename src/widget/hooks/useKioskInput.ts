import { useState, useCallback } from "react";

export type UseKioskInputOptions = {
  value: number;
  anchors: Array<{ label: string; value: number }>;
  onCommit: (value: number) => void;
  parseRaw?: (raw: string) => number;
};

export function useKioskInput({ value, anchors, onCommit, parseRaw }: UseKioskInputOptions) {
  const [customText, setCustomText] = useState("");
  const [isCustomActive, setIsCustomActive] = useState(false);

  const isAnchorMatch = anchors.some((a) => a.value === value);

  const selectAnchor = useCallback(
    (anchorValue: number) => {
      setIsCustomActive(false);
      setCustomText("");
      onCommit(anchorValue);
    },
    [onCommit],
  );

  const focusCustom = useCallback(() => {
    setIsCustomActive(true);
  }, []);

  const changeCustom = useCallback((raw: string) => {
    setCustomText(raw);
  }, []);

  const blurCustom = useCallback(() => {
    if (!customText) {
      setIsCustomActive(false);
      return;
    }
    const parser = parseRaw ?? ((r: string) => parseFloat(r.replace(/,/g, "")));
    const parsed = parser(customText);
    if (Number.isFinite(parsed)) {
      onCommit(parsed);
    }
    setIsCustomActive(false);
  }, [customText, onCommit, parseRaw]);

  const displayCustom = isCustomActive
    ? customText
    : isAnchorMatch
      ? ""
      : String(value);

  return {
    isAnchorMatch: isAnchorMatch && !isCustomActive,
    displayCustom,
    selectAnchor,
    focusCustom,
    changeCustom,
    blurCustom,
  };
}
