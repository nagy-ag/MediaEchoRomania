import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShellCardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  staggerIndex?: number;
}

export function ShellCard({
  children,
  className,
  elevated = false,
  staggerIndex,
}: ShellCardProps) {
  const staggerStyle: CSSProperties | undefined =
    staggerIndex !== undefined
      ? { "--stagger": `${staggerIndex * 60}ms` } as CSSProperties
      : undefined;

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border-soft)] bg-[var(--panel-bg)] p-5 shadow-[var(--shadow-card)]",
        "transition-all duration-[var(--motion-base)] ease-[var(--ease-fluid)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]",
        "motion-safe:animate-[fadeInUp_400ms_var(--ease-fluid)_var(--stagger,0ms)_both]",
        elevated && "bg-[var(--panel-raised)]",
        className,
      )}
      style={staggerStyle}
    >
      {children}
    </section>
  );
}

