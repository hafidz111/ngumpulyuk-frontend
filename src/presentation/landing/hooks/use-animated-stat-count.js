import { useEffect, useRef, useState } from 'react';

const LOAD_TICK_MS = 72;
const SETTLE_MS = 1100;

/**
 * Angka naik-turun saat loading, lalu ease ke nilai API.
 * @param {number} target
 * @param {boolean} isLoading
 * @param {number} [delayMs] stagger antar stat
 */
export function useAnimatedStatCount(target, isLoading, delayMs = 0) {
  const safeTarget = Number.isFinite(target) ? Math.max(0, Math.round(target)) : 0;
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  const settleStartedRef = useRef(false);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    settleStartedRef.current = false;
    if (!isLoading) return undefined;

    const id = window.setInterval(() => {
      setDisplay((prev) => {
        const direction = Math.random() > 0.45 ? 1 : -1;
        const step = 1 + Math.floor(Math.random() * 4);
        const ceiling = Math.max(safeTarget, 24, prev + 8);
        const next = prev + direction * step;
        return Math.min(ceiling, Math.max(0, next));
      });
    }, LOAD_TICK_MS);

    return () => window.clearInterval(id);
  }, [isLoading, safeTarget]);

  useEffect(() => {
    if (isLoading) return undefined;

    let rafId = 0;
    let timeoutId = 0;

    const runSettle = () => {
      if (settleStartedRef.current) return;
      settleStartedRef.current = true;

      const from = displayRef.current;
      const to = safeTarget;
      const startAt = performance.now();

      const frame = (now) => {
        const elapsed = now - startAt;
        const progress = Math.min(1, elapsed / SETTLE_MS);
        const eased = 1 - (1 - progress) ** 3;
        const next = Math.round(from + (to - from) * eased);
        setDisplay(next);
        if (progress < 1) {
          rafId = requestAnimationFrame(frame);
        }
      };

      rafId = requestAnimationFrame(frame);
    };

    if (delayMs > 0) {
      timeoutId = window.setTimeout(runSettle, delayMs);
    } else {
      runSettle();
    }

    return () => {
      window.clearTimeout(timeoutId);
      cancelAnimationFrame(rafId);
    };
  }, [isLoading, safeTarget, delayMs]);

  return display;
}
