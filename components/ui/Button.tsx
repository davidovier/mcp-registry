"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-150
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      hover:-translate-y-[1px] active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-brand-600 text-white
        hover:bg-brand-700
        dark:bg-brand-500 dark:text-neutral-950 dark:hover:bg-brand-400
      `,
      secondary: `
        bg-surface-secondary text-content-primary
        border border-border
        hover:bg-surface-sunken hover:border-border-strong
      `,
      ghost: `
        text-content-secondary
        hover:text-content-primary hover:bg-surface-sunken
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700
      `,
    };

    const sizes = {
      sm: "h-8 px-3 text-body-sm rounded-md",
      md: "h-10 px-4 text-body-md rounded-lg",
      lg: "h-12 px-6 text-body-lg rounded-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : icon && iconPosition === "left" ? (
          icon
        ) : null}
        {children}
        {!loading && icon && iconPosition === "right" ? icon : null}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
