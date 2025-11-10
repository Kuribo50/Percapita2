"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Simple static number with a unified fade-in. No counting.
export default function NumberTicker({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  // Trigger a one-shot fade-in on mount so all instances appear a la vez.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const formatted = Intl.NumberFormat("es-CL").format(Math.round(value));

  return (
    <span
      className={cn(
        "inline-block tabular-nums text-black dark:text-white tracking-wider transition-opacity duration-500 ease-out",
        visible ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {formatted}
    </span>
  );
}
