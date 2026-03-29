import { useEffect, useRef, useState } from "react";

type UseDelayedVisibilityOptions = {
  delayMs?: number;
  minVisibleMs?: number;
};

export const useDelayedVisibility = (
  active: boolean,
  { delayMs = 240, minVisibleMs = 220 }: UseDelayedVisibilityOptions = {},
) => {
  const [visible, setVisible] = useState(false);
  const shownAtRef = useRef<number | null>(null);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (active) {
      timeoutId = window.setTimeout(() => {
        shownAtRef.current = Date.now();
        setVisible(true);
      }, delayMs);
    } else if (visible) {
      const elapsed = shownAtRef.current ? Date.now() - shownAtRef.current : 0;
      timeoutId = window.setTimeout(() => {
        shownAtRef.current = null;
        setVisible(false);
      }, Math.max(0, minVisibleMs - elapsed));
    } else {
      shownAtRef.current = null;
      setVisible(false);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [active, delayMs, minVisibleMs, visible]);

  return visible;
};
