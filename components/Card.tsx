import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-card md:p-8 ${className}`}>{children}</section>;
}
