"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/src/lib/utils";

type CountUpValueProps = {
  value: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  fromValue?: number;
  className?: string;
};

function easeOutCubic(input: number) {
  return 1 - Math.pow(1 - input, 3);
}

export function CountUpValue({
  value,
  durationMs = 900,
  prefix = "",
  suffix = "",
  fromValue,
  className,
}: CountUpValueProps) {
  const startValue = typeof fromValue === "number" ? fromValue : value;
  const [display, setDisplay] = useState(startValue);
  const previousValueRef = useRef(startValue);

  useEffect(() => {
    const from = previousValueRef.current;
    const to = value;

    if (from === to) {
      return;
    }

    let rafId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.max(0, Math.min(1, elapsed / durationMs));
      const eased = easeOutCubic(progress);
      const next = from + (to - from) * eased;

      setDisplay(next);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      }
    };

    rafId = window.requestAnimationFrame(step);
    previousValueRef.current = to;

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [value, durationMs]);

  const rounded = Math.round(display);

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {rounded.toLocaleString("sr-RS")}
      {suffix}
    </span>
  );
}
