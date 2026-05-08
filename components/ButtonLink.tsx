import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-research-600 text-white shadow-sm hover:bg-research-700 focus-visible:outline-research-600",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:border-research-600 hover:text-research-700 focus-visible:outline-research-600",
  ghost: "text-slate-600 hover:text-research-700 focus-visible:outline-research-600",
};

export function ButtonLink({ href, children, variant = "primary", className = "", ...props }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
