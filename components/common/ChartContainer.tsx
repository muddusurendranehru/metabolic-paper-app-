"use client";

import { useRef, type ReactNode } from "react";

interface ChartContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function ChartContainer({
  children,
  title,
  className = "",
}: ChartContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} className={`rounded border p-4 ${className}`}>
      {title && <h3 className="mb-3 font-semibold">{title}</h3>}
      {children}
    </div>
  );
}
