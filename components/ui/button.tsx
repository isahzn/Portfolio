import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Reusable Button primitive (docs/04_COMPONENT_LIBARY.MD, floza-redesign.html).
 *
 * Sharp corners, hairline borders, indigo primary — matches the editorial
 * design system. Renders a `<button>` by default, or a next/link `<a>` when
 * `href` is provided. Server-component safe.
 */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = ButtonBaseProps & ComponentProps<"button"> & { href?: undefined };
type ButtonAsLink = ButtonBaseProps & ComponentProps<"a"> & { href: string };
type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-primary bg-primary text-white hover:border-primary-dim hover:bg-primary-dim active:scale-[0.98]",
  secondary:
    "border border-primary/30 bg-primary/10 text-primary hover:border-primary/50 hover:bg-primary/15 active:scale-[0.98]",
  outline:
    "border border-border text-foreground hover:border-faint hover:bg-surface-2 active:scale-[0.98]",
  ghost: "border border-transparent text-muted hover:text-foreground active:scale-[0.98]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-10 px-5 text-sm",
  lg: "h-11 px-6 text-[14.5px]",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props as ButtonAsLink;
    return (
      <Link href={href} className={classes} {...anchorProps}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} {...(props as ComponentProps<"button">)}>
      {children}
    </button>
  );
}
