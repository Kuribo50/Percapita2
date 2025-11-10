"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  color?: string;
}

export function ShineBorder({ children, className, color = "rgba(99, 102, 241, 0.5)", ...props }: ShineBorderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800",
        className
      )}
      style={{
        boxShadow: `0 0 20px ${color}`,
      }}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      {children}
    </div>
  );
}
