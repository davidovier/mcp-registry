# MCP Registry Design System & UX Specification

## Design Direction: "Precision Trust"

A registry that communicates **institutional credibility** through **Swiss-inspired clarity**. Think: the reliability of a financial institution meets the openness of open-source. Clean geometric forms, a monochromatic base with strategic accent colors for trust signals, and typography that whispers confidence.

**Aesthetic pillars:**

- **Geometric precision** — Sharp corners, consistent grid, mathematical spacing
- **Trust through transparency** — Clear status indicators, visible verification, explicit metadata
- **Editorial restraint** — Let content breathe, reduce visual noise to essential signals
- **Functional beauty** — Every element earns its place

---

## A) UX Goals, Personas & Journeys

### UX Goals

1. **Reduce time-to-install** — From landing to integration in <60 seconds
2. **Build confidence** — Clear trust signals reduce "is this safe?" anxiety
3. **Streamline contribution** — Submitting feels encouraging, not bureaucratic
4. **Surface quality** — Verified, well-maintained servers rise naturally

### Personas

| Persona           | Goal                                    | Pain Point                                     |
| ----------------- | --------------------------------------- | ---------------------------------------------- |
| **Dev Dana**      | Find a server for their project quickly | Overwhelmed by choices, unsure which to trust  |
| **Builder Blake** | Submit their new MCP server             | Confused by validation errors, unclear process |
| **Admin Alex**    | Review submissions efficiently          | Context-switching between queue and details    |

### Top Journeys

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. DISCOVER SERVER                                              │
│    Landing → Search/Filter → Scan results → Click card →        │
│    Review details → Copy install command                        │
│    ⏱ Target: <45 seconds                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. COMPARE SERVERS                                              │
│    Search → Apply tag filter → Scan multiple cards →            │
│    Open 2-3 in tabs → Compare capabilities/auth                 │
│    ⏱ Target: <2 minutes                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. SUBMIT A SERVER                                              │
│    Click Submit → Fill form with live preview →                 │
│    Fix inline errors → Submit → See confirmation                │
│    ⏱ Target: <5 minutes                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 4. FIX & RESUBMIT                                               │
│    Email notification → My Submissions → See errors →           │
│    Click Edit → Fix issues → Resubmit                           │
│    ⏱ Target: <3 minutes                                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 5. ADMIN REVIEW                                                 │
│    Queue view → Click submission → Review diff →                │
│    Approve/Reject with note → Next item                         │
│    ⏱ Target: <90 seconds per review                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## B) Information Architecture

### Navigation Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  ◇ MCP Registry          Explore    Submit    [Sign In]           │
│                                                                    │
│  (authenticated):                                                  │
│  ◇ MCP Registry          Explore    Submit    My Servers  [Avatar]│
│                                      ↓                             │
│                              ┌───────────────┐                     │
│                              │ New Submission│                     │
│                              │ My Submissions│                     │
│                              │ ───────────── │                     │
│                              │ Admin Queue ▸ │ (if admin)          │
│                              └───────────────┘                     │
└────────────────────────────────────────────────────────────────────┘
```

### Page Hierarchy

```
/                          → Redirect to /servers
/servers                   → Browse & search all servers
/servers/[slug]            → Server detail page
/submit                    → New submission form
/my/submissions            → User's submission history
/admin/submissions         → Admin review queue (protected)
/admin/submissions/[id]    → Admin detail review (protected)
/signin                    → Authentication
```

---

## C) Design System Tokens

### Typography Scale

**Font Selection:**

- **Display/Headings:** `"Söhne", "Helvetica Neue", system-ui, sans-serif`
- **Body/UI:** `"Söhne", "Helvetica Neue", system-ui, sans-serif`
- **Mono/Code:** `"Söhne Mono", "SF Mono", Consolas, monospace`

```css
/* tailwind.config.js extension */
fontSize: {
  'display-xl': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
  'display-lg': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '600' }],
  'display-md': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
  'heading-lg': ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '500' }],
  'heading-md': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
  'heading-sm': ['0.9375rem', { lineHeight: '1.4', fontWeight: '500' }],
  'body-lg': ['1rem', { lineHeight: '1.6' }],
  'body-md': ['0.9375rem', { lineHeight: '1.6' }],
  'body-sm': ['0.8125rem', { lineHeight: '1.5' }],
  'caption': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
  'mono-md': ['0.875rem', { lineHeight: '1.5' }],
  'mono-sm': ['0.8125rem', { lineHeight: '1.5' }],
}
```

### Spacing Scale (8px base)

```css
spacing: {
  'px': '1px',
  '0': '0',
  '1': '0.25rem',   // 4px
  '2': '0.5rem',    // 8px
  '3': '0.75rem',   // 12px
  '4': '1rem',      // 16px
  '5': '1.25rem',   // 20px
  '6': '1.5rem',    // 24px
  '8': '2rem',      // 32px
  '10': '2.5rem',   // 40px
  '12': '3rem',     // 48px
  '16': '4rem',     // 64px
  '20': '5rem',     // 80px
  '24': '6rem',     // 96px
}
```

### Color Tokens

```css
/* CSS Custom Properties for theming */

:root {
  /* Neutrals — warm gray base */
  --color-neutral-50: #fafaf9;
  --color-neutral-100: #f5f5f4;
  --color-neutral-200: #e7e5e4;
  --color-neutral-300: #d6d3d1;
  --color-neutral-400: #a8a29e;
  --color-neutral-500: #78716c;
  --color-neutral-600: #57534e;
  --color-neutral-700: #44403c;
  --color-neutral-800: #292524;
  --color-neutral-900: #1c1917;
  --color-neutral-950: #0c0a09;

  /* Primary — deep teal for trust */
  --color-primary-50: #f0fdfa;
  --color-primary-100: #ccfbf1;
  --color-primary-200: #99f6e4;
  --color-primary-300: #5eead4;
  --color-primary-400: #2dd4bf;
  --color-primary-500: #14b8a6;
  --color-primary-600: #0d9488;
  --color-primary-700: #0f766e;
  --color-primary-800: #115e59;
  --color-primary-900: #134e4a;

  /* Accent — warm amber for highlights */
  --color-accent-400: #fbbf24;
  --color-accent-500: #f59e0b;
  --color-accent-600: #d97706;

  /* Semantic */
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;

  /* Surfaces — Light Mode */
  --surface-primary: var(--color-neutral-50);
  --surface-secondary: #ffffff;
  --surface-elevated: #ffffff;
  --surface-sunken: var(--color-neutral-100);

  /* Text — Light Mode */
  --text-primary: var(--color-neutral-900);
  --text-secondary: var(--color-neutral-600);
  --text-tertiary: var(--color-neutral-500);
  --text-inverse: #ffffff;

  /* Borders */
  --border-default: var(--color-neutral-200);
  --border-strong: var(--color-neutral-300);
  --border-focus: var(--color-primary-500);
}

.dark {
  --surface-primary: var(--color-neutral-950);
  --surface-secondary: var(--color-neutral-900);
  --surface-elevated: var(--color-neutral-800);
  --surface-sunken: #000000;

  --text-primary: var(--color-neutral-100);
  --text-secondary: var(--color-neutral-400);
  --text-tertiary: var(--color-neutral-500);
  --text-inverse: var(--color-neutral-900);

  --border-default: var(--color-neutral-800);
  --border-strong: var(--color-neutral-700);
}
```

### Tailwind Config Extension

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          primary: "var(--surface-primary)",
          secondary: "var(--surface-secondary)",
          elevated: "var(--surface-elevated)",
          sunken: "var(--surface-sunken)",
        },
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          inverse: "var(--text-inverse)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          strong: "var(--border-strong)",
          focus: "var(--border-focus)",
        },
        brand: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
        },
      },
      fontFamily: {
        sans: ["Söhne", "Helvetica Neue", "system-ui", "sans-serif"],
        mono: ["Söhne Mono", "SF Mono", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover":
          "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)",
        elevated:
          "0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
};
```

---

## D) Component Primitives

### Button

```tsx
// components/ui/Button.tsx
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
      active:scale-[0.98]
    `;

    const variants = {
      primary: `
        bg-brand-600 text-white
        hover:bg-brand-700
        dark:bg-brand-500 dark:hover:bg-brand-600
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
```

### Input

```tsx
// components/ui/Input.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-body-sm font-medium text-content-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              `h-10 w-full rounded-lg border border-border bg-surface-secondary px-3 text-content-primary transition-colors duration-150 placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50`,
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-caption text-content-tertiary">{hint}</p>
        )}
        {error && (
          <p className="flex items-center gap-1 text-caption text-red-500">
            <svg
              className="h-3.5 w-3.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
```

### Select

```tsx
// components/ui/Select.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, hint, error, options, placeholder, id, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-body-sm font-medium text-content-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              `h-10 w-full appearance-none rounded-lg border border-border bg-surface-secondary px-3 pr-10 text-content-primary transition-colors duration-150 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50`,
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-tertiary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {hint && !error && (
          <p className="text-caption text-content-tertiary">{hint}</p>
        )}
        {error && <p className="text-caption text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
```

### Checkbox

```tsx
// components/ui/Checkbox.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          "group flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative mt-0.5 flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              `h-5 w-5 rounded border-2 border-border transition-all duration-150 group-hover:border-border-strong peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2`
            )}
          >
            <svg
              className="h-full w-full text-white opacity-0 transition-opacity peer-checked:opacity-100"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="text-body-md font-medium text-content-primary">
                {label}
              </span>
            )}
            {description && (
              <p className="text-body-sm text-content-secondary">
                {description}
              </p>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
export { Checkbox };
```

### Badge / Chip

```tsx
// components/ui/Badge.tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "brand";
  size?: "sm" | "md";
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot,
  removable,
  onRemove,
  className,
}: BadgeProps) {
  const variants = {
    default:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    success:
      "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    error: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    info: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    brand:
      "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400",
  };

  const dotColors = {
    default: "bg-neutral-400",
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    brand: "bg-brand-500",
  };

  const sizes = {
    sm: "text-caption px-2 py-0.5",
    md: "text-body-sm px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
```

### Card

```tsx
// components/ui/Card.tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "interactive" | "selected";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  variant = "default",
  padding = "md",
  className,
  onClick,
}: CardProps) {
  const baseStyles = `
    bg-surface-secondary rounded-xl border border-border
    transition-all duration-150
  `;

  const variants = {
    default: "",
    interactive: `
      cursor-pointer shadow-card
      hover:shadow-card-hover hover:border-border-strong
      active:scale-[0.995]
    `,
    selected: `
      border-brand-500 ring-1 ring-brand-500
    `,
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        className
      )}
      onClick={onClick}
    >
      {children}
    </Component>
  );
}

// Subcomponents for composition
Card.Header = function CardHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {children}
    </div>
  );
};

Card.Title = function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("text-heading-md text-content-primary", className)}>
      {children}
    </h3>
  );
};

Card.Description = function CardDescription({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "line-clamp-2 text-body-sm text-content-secondary",
        className
      )}
    >
      {children}
    </p>
  );
};

Card.Footer = function CardFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-3 flex items-center gap-2 border-t border-border pt-3",
        className
      )}
    >
      {children}
    </div>
  );
};
```

### Table / ListRow

```tsx
// components/ui/Table.tsx
import { cn } from "@/lib/utils";

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">{children}</table>
    </div>
  );
}

Table.Head = function TableHead({ children, className }: TableProps) {
  return (
    <thead className={cn("border-b border-border", className)}>
      {children}
    </thead>
  );
};

Table.Body = function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
};

Table.Row = function TableRow({
  children,
  className,
  onClick,
  hoverable = true,
}: TableProps & { onClick?: () => void; hoverable?: boolean }) {
  return (
    <tr
      className={cn(
        "border-b border-border last:border-0",
        hoverable && "transition-colors hover:bg-surface-sunken",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

Table.HeaderCell = function TableHeaderCell({
  children,
  className,
  align = "left",
}: TableProps & { align?: "left" | "center" | "right" }) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-caption font-medium uppercase tracking-wide text-content-tertiary",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
};

Table.Cell = function TableCell({
  children,
  className,
  align = "left",
}: TableProps & { align?: "left" | "center" | "right" }) {
  return (
    <td
      className={cn(
        "px-4 py-3 text-body-sm text-content-primary",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
};

// Alternative: ListRow for card-based lists
interface ListRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListRow({ children, onClick, className }: ListRowProps) {
  return (
    <div
      className={cn(
        `flex items-center gap-4 border-b border-border p-4 transition-colors last:border-0 hover:bg-surface-sunken`,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
```

### Pagination

```tsx
// components/ui/Pagination.tsx
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 1;
    const range: (number | "ellipsis")[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== "ellipsis") {
        range.push("ellipsis");
      }
    }

    return range;
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-center gap-1", className)}
      aria-label="Pagination"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </Button>

      {getVisiblePages().map((page, i) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="px-2 text-content-tertiary">
            …
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn(
              "min-w-[2rem]",
              page === currentPage && "border-brand-500 text-brand-600"
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </nav>
  );
}
```

### Toast / Alert

```tsx
// components/ui/Toast.tsx
import { cn } from "@/lib/utils";

interface ToastProps {
  title?: string;
  message: string;
  variant?: "info" | "success" | "warning" | "error";
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function Toast({
  title,
  message,
  variant = "info",
  onClose,
  action,
}: ToastProps) {
  const icons = {
    info: (
      <svg
        className="h-5 w-5 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    success: (
      <svg
        className="h-5 w-5 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="h-5 w-5 text-amber-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    error: (
      <svg
        className="h-5 w-5 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        `flex animate-slide-up items-start gap-3 rounded-lg border border-border bg-surface-elevated p-4 shadow-elevated`
      )}
    >
      {icons[variant]}
      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-body-sm font-medium text-content-primary">
            {title}
          </p>
        )}
        <p
          className={cn(
            "text-body-sm text-content-secondary",
            title && "mt-0.5"
          )}
        >
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-body-sm font-medium text-brand-600 hover:text-brand-700"
          >
            {action.label}
          </button>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-content-tertiary transition-colors hover:text-content-secondary"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

// Alert variant (inline, non-dismissible)
interface AlertProps {
  title?: string;
  children: React.ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  className?: string;
}

export function Alert({
  title,
  children,
  variant = "info",
  className,
}: AlertProps) {
  const variants = {
    info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    success:
      "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
    warning:
      "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
  };

  return (
    <div className={cn("rounded-lg border p-4", variants[variant], className)}>
      {title && (
        <p className="mb-1 text-body-sm font-medium text-content-primary">
          {title}
        </p>
      )}
      <div className="text-body-sm text-content-secondary">{children}</div>
    </div>
  );
}
```

### EmptyState

```tsx
// components/ui/EmptyState.tsx
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-sunken text-content-tertiary">
          {icon}
        </div>
      )}
      <h3 className="mb-1 text-heading-md text-content-primary">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-body-md text-content-secondary">
          {description}
        </p>
      )}
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
```

### Skeleton

```tsx
// components/ui/Skeleton.tsx
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
}: SkeletonProps) {
  const variants = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-surface-sunken",
        variants[variant],
        className
      )}
      style={{ width, height }}
    />
  );
}

// Pre-built skeleton patterns
Skeleton.Card = function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" className="h-10 w-10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  );
};

Skeleton.Row = function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-border p-4">
      <Skeleton variant="circular" className="h-8 w-8 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
};
```

### Breadcrumbs

```tsx
// components/ui/Breadcrumbs.tsx
import { cn } from "@/lib/utils";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-1.5 text-body-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && (
                <svg
                  className="h-4 w-4 text-content-tertiary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast || !item.href ? (
                <span
                  className={cn(
                    isLast
                      ? "font-medium text-content-primary"
                      : "text-content-tertiary"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-content-secondary transition-colors hover:text-content-primary"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

## E) High-Fidelity Page Designs

### 1. /servers — Browse & Search

```tsx
// app/servers/page.tsx
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState } from "@/components/ui/EmptyState";

// Server Card Component
function ServerCard({ server }: { server: Server }) {
  return (
    <Card variant="interactive" padding="none" className="group">
      <Link href={`/servers/${server.slug}`} className="block p-4">
        <Card.Header>
          <div className="flex items-center gap-3">
            {/* Server icon/avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 font-semibold text-brand-600 dark:from-brand-900 dark:to-brand-800 dark:text-brand-400">
              {server.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Card.Title className="truncate">{server.name}</Card.Title>
                {server.verified && <VerifiedBadge />}
              </div>
              <p className="truncate text-caption text-content-tertiary">
                {server.slug}
              </p>
            </div>
          </div>
        </Card.Header>

        <Card.Description className="mt-3">
          {server.description}
        </Card.Description>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {server.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} size="sm" variant="default">
              {tag}
            </Badge>
          ))}
          {server.tags.length > 3 && (
            <Badge size="sm" variant="default">
              +{server.tags.length - 3}
            </Badge>
          )}
        </div>

        {/* Metadata footer */}
        <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-caption text-content-tertiary">
          <span className="flex items-center gap-1">
            <TransportIcon transport={server.transport} />
            {server.transport}
          </span>
          {server.auth && (
            <span className="flex items-center gap-1">
              <LockIcon className="h-3.5 w-3.5" />
              {server.auth}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1">
            <CapabilitiesIcon className="h-3.5 w-3.5" />
            {server.capabilities.length} capabilities
          </span>
        </div>
      </Link>
    </Card>
  );
}

// Verified Badge with tooltip
function VerifiedBadge() {
  return (
    <span
      className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white"
      title="Verified Server"
    >
      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

// Active Filter Chip
function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-body-sm font-medium text-brand-700 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
    >
      {label}
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}

// Main Page Component
export default function ServersPage() {
  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Hero Section with Search */}
      <section className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="mb-2 text-center text-display-lg text-content-primary">
            MCP Server Registry
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-center text-body-lg text-content-secondary">
            Discover and integrate trusted Model Context Protocol servers into
            your applications.
          </p>

          {/* Search Bar */}
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="search"
                placeholder="Search servers by name, description, or tags..."
                className="h-14 w-full rounded-xl border border-border bg-surface-primary pl-12 pr-4 text-body-lg text-content-primary transition-all placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filter Sidebar */}
          <aside className="flex-shrink-0 lg:w-64">
            <div className="sticky top-4 space-y-6">
              <div>
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  Transport
                </h3>
                <div className="space-y-2">
                  {["stdio", "http", "websocket"].map((transport) => (
                    <label
                      key={transport}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-body-sm capitalize text-content-secondary">
                        {transport}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  Authentication
                </h3>
                <div className="space-y-2">
                  {["None", "API Key", "OAuth"].map((auth) => (
                    <label
                      key={auth}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-body-sm text-content-secondary">
                        {auth}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-heading-sm text-content-primary">
                  Capabilities
                </h3>
                <div className="space-y-2">
                  {["tools", "resources", "prompts", "sampling"].map((cap) => (
                    <label
                      key={cap}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-body-sm capitalize text-content-secondary">
                        {cap}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-body-sm font-medium text-content-primary">
                    Verified only
                  </span>
                </label>
              </div>
            </div>
          </aside>

          {/* Results */}
          <main className="flex-1">
            {/* Active Filters + Sort */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-body-sm text-content-tertiary">
                  128 servers
                </span>
                {/* Show active filters here */}
                <FilterChip label="stdio" onRemove={() => {}} />
                <FilterChip label="verified" onRemove={() => {}} />
              </div>

              <Select
                options={[
                  { value: "relevance", label: "Most Relevant" },
                  { value: "newest", label: "Newest First" },
                  { value: "name", label: "Name A-Z" },
                ]}
                className="w-40"
              />
            </div>

            {/* Server Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              {servers.map((server) => (
                <ServerCard key={server.slug} server={server} />
              ))}
            </div>

            {/* Pagination - Using numbered pagination for discoverability */}
            <div className="mt-8 border-t border-border pt-8">
              <Pagination
                currentPage={1}
                totalPages={13}
                onPageChange={(page) => console.log(page)}
              />
              {/* Pagination rationale: Numbered pagination chosen over "Load More"
                  because users browsing a registry often want to:
                  1. Jump to specific pages (especially returning users)
                  2. Understand the total scope of results
                  3. Share specific page URLs */}
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
```

---

### 2. /servers/[slug] — Server Detail

```tsx
// app/servers/[slug]/page.tsx
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";

// Install Command Component with copy
function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-mono-md text-neutral-100">
        <code>{command}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md bg-neutral-800 p-2 text-neutral-400 opacity-0 transition-all hover:bg-neutral-700 hover:text-neutral-200 group-hover:opacity-100"
      >
        {copied ? (
          <svg
            className="h-4 w-4 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}

// Metadata Item
function MetadataItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-border py-3 last:border-0">
      {icon && (
        <div className="mt-0.5 h-5 w-5 flex-shrink-0 text-content-tertiary">
          {icon}
        </div>
      )}
      <div>
        <dt className="text-caption uppercase tracking-wide text-content-tertiary">
          {label}
        </dt>
        <dd className="mt-0.5 text-body-md text-content-primary">{value}</dd>
      </div>
    </div>
  );
}

export default function ServerDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const server = getServer(params.slug); // Your data fetching

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-surface-secondary">
        <div className="mx-auto max-w-5xl px-4 py-3">
          <Breadcrumbs
            items={[
              { label: "Servers", href: "/servers" },
              { label: server.name },
            ]}
          />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <main className="space-y-8 lg:col-span-2">
            {/* Header */}
            <header className="flex items-start gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-display-md font-semibold text-brand-600 dark:from-brand-900 dark:to-brand-800 dark:text-brand-400">
                {server.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-display-md text-content-primary">
                    {server.name}
                  </h1>
                  {server.verified && <VerifiedBadge size="lg" />}
                </div>
                <p className="mt-1 text-body-md text-content-tertiary">
                  {server.slug}
                </p>
              </div>
            </header>

            {/* Description */}
            <section>
              <p className="text-body-lg leading-relaxed text-content-secondary">
                {server.description}
              </p>
            </section>

            {/* Install Section */}
            <section>
              <h2 className="mb-4 text-heading-lg text-content-primary">
                Installation
              </h2>
              <InstallCommand command={`npx mcp-install ${server.slug}`} />
              <p className="mt-2 text-body-sm text-content-tertiary">
                Or add to your{" "}
                <code className="rounded bg-surface-sunken px-1 py-0.5 text-mono-sm">
                  mcp.json
                </code>{" "}
                configuration manually.
              </p>
            </section>

            {/* Capabilities */}
            <section>
              <h2 className="mb-4 text-heading-lg text-content-primary">
                Capabilities
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {server.capabilities.map((cap) => (
                  <Card key={cap.name} padding="sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                        <CapabilityIcon type={cap.type} />
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-content-primary">
                          {cap.name}
                        </p>
                        <p className="text-caption capitalize text-content-tertiary">
                          {cap.type}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Links */}
            {server.links && server.links.length > 0 && (
              <section>
                <h2 className="mb-4 text-heading-lg text-content-primary">
                  Links
                </h2>
                <div className="flex flex-wrap gap-2">
                  {server.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-secondary px-3 py-2 text-body-sm text-content-primary transition-colors hover:border-border-strong"
                    >
                      <LinkIcon type={link.type} className="h-4 w-4" />
                      {link.label}
                      <ExternalLinkIcon className="h-3 w-3 text-content-tertiary" />
                    </a>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <Card padding="md">
              <div className="space-y-3">
                <Button className="w-full" variant="primary">
                  <CopyIcon className="h-4 w-4" />
                  Copy Install Command
                </Button>
                <Button className="w-full" variant="secondary">
                  <ExternalLinkIcon className="h-4 w-4" />
                  View Source
                </Button>
              </div>
            </Card>

            {/* Metadata */}
            <Card padding="md">
              <h3 className="mb-2 text-heading-sm text-content-primary">
                Details
              </h3>
              <dl>
                <MetadataItem
                  label="Transport"
                  value={<Badge variant="default">{server.transport}</Badge>}
                  icon={<TransportIcon />}
                />
                <MetadataItem
                  label="Authentication"
                  value={server.auth || "None required"}
                  icon={<LockIcon />}
                />
                <MetadataItem
                  label="Tags"
                  value={
                    <div className="flex flex-wrap gap-1">
                      {server.tags.map((tag) => (
                        <Badge key={tag} size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  }
                  icon={<TagIcon />}
                />
              </dl>
            </Card>

            {/* Trust Actions (Placeholders) */}
            <Card padding="md" className="border-dashed">
              <h3 className="mb-3 text-heading-sm text-content-primary">
                Trust & Ownership
              </h3>
              <div className="space-y-2">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-content-secondary transition-colors hover:bg-surface-sunken">
                  <FlagIcon className="h-4 w-4" />
                  Report an issue
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-content-secondary transition-colors hover:bg-surface-sunken">
                  <UserIcon className="h-4 w-4" />
                  Claim ownership
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-body-sm text-content-secondary transition-colors hover:bg-surface-sunken">
                  <ShieldIcon className="h-4 w-4" />
                  Request verification
                </button>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
```

---

### 3. /submit — Submission Form

```tsx
// app/submit/page.tsx
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/Toast";

// Tag Input Component
function TagInput({
  value,
  onChange,
  suggestions,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [input, setInput] = useState("");

  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <label className="block text-body-sm font-medium text-content-primary">
        Tags
      </label>
      <div className="flex min-h-[2.75rem] flex-wrap gap-2 rounded-lg border border-border bg-surface-secondary p-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="brand"
            removable
            onRemove={() => removeTag(tag)}
          >
            {tag}
          </Badge>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            }
          }}
          placeholder={value.length === 0 ? "Add tags..." : ""}
          className="min-w-[100px] flex-1 bg-transparent text-body-sm text-content-primary outline-none placeholder:text-content-tertiary"
        />
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-caption text-content-tertiary">
            Suggestions:
          </span>
          {suggestions
            .filter((s) => !value.includes(s))
            .slice(0, 5)
            .map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => addTag(suggestion)}
                className="text-caption text-brand-600 hover:text-brand-700"
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// Live Preview Card
function PreviewCard({ data }: { data: Partial<Server> }) {
  return (
    <Card variant="default" padding="md" className="border-2 border-dashed">
      <p className="mb-3 text-caption uppercase tracking-wide text-content-tertiary">
        Preview
      </p>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-100 to-brand-200 font-semibold text-brand-600 dark:from-brand-900 dark:to-brand-800 dark:text-brand-400">
          {data.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-heading-md text-content-primary">
            {data.name || "Server Name"}
          </h3>
          <p className="text-caption text-content-tertiary">
            {data.slug || "server-slug"}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-body-sm text-content-secondary">
        {data.description || "Your server description will appear here..."}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(data.tags || []).map((tag) => (
          <Badge key={tag} size="sm" variant="default">
            {tag}
          </Badge>
        ))}
        {(!data.tags || data.tags.length === 0) && (
          <Badge size="sm" variant="default" className="opacity-50">
            tags
          </Badge>
        )}
      </div>
    </Card>
  );
}

// Progress Steps
function FormProgress({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: string[];
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-medium transition-colors",
              index < currentStep && "bg-brand-600 text-white",
              index === currentStep &&
                "bg-brand-100 text-brand-700 ring-2 ring-brand-500 dark:bg-brand-900 dark:text-brand-400",
              index > currentStep && "bg-surface-sunken text-content-tertiary"
            )}
          >
            {index < currentStep ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "mx-2 h-0.5 w-12",
                index < currentStep ? "bg-brand-500" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function SubmitPage() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Server>>({
    tags: [],
    capabilities: [],
  });

  const steps = ["Basic Info", "Configuration", "Review"];

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-display-md text-content-primary">
            Submit a Server
          </h1>
          <p className="text-body-lg text-content-secondary">
            Share your MCP server with the community. All submissions are
            reviewed before publishing.
          </p>
        </header>

        {/* Progress */}
        <div className="mb-8 flex justify-center">
          <FormProgress currentStep={step} steps={steps} />
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <main className="lg:col-span-3">
            <Card padding="lg">
              {step === 0 && (
                <div className="space-y-6">
                  <Input
                    label="Server Name"
                    placeholder="My Awesome Server"
                    hint="A human-readable name for your server"
                    value={formData.name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  <Input
                    label="Slug"
                    placeholder="my-awesome-server"
                    hint="Unique identifier (lowercase, hyphens only)"
                    value={formData.slug || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="block text-body-sm font-medium text-content-primary">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe what your server does and its main features..."
                      className="w-full resize-none rounded-lg border border-border bg-surface-secondary px-3 py-2 text-content-primary placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <TagInput
                    value={formData.tags || []}
                    onChange={(tags) => setFormData({ ...formData, tags })}
                    suggestions={[
                      "database",
                      "ai",
                      "filesystem",
                      "api",
                      "search",
                    ]}
                  />
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <Select
                    label="Transport"
                    options={[
                      { value: "stdio", label: "Standard I/O (stdio)" },
                      { value: "http", label: "HTTP" },
                      { value: "websocket", label: "WebSocket" },
                    ]}
                    hint="How clients connect to your server"
                    value={formData.transport || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transport: e.target.value as any,
                      })
                    }
                  />

                  <Select
                    label="Authentication"
                    options={[
                      { value: "none", label: "None" },
                      { value: "api_key", label: "API Key" },
                      { value: "oauth", label: "OAuth 2.0" },
                    ]}
                    value={formData.auth || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, auth: e.target.value as any })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className="block text-body-sm font-medium text-content-primary">
                      Capabilities
                    </label>
                    <div className="space-y-2">
                      {["tools", "resources", "prompts", "sampling"].map(
                        (cap) => (
                          <Checkbox
                            key={cap}
                            label={cap.charAt(0).toUpperCase() + cap.slice(1)}
                            description={`This server provides ${cap}`}
                            checked={(formData.capabilities || []).includes(
                              cap
                            )}
                            onChange={(e) => {
                              const caps = formData.capabilities || [];
                              setFormData({
                                ...formData,
                                capabilities: e.target.checked
                                  ? [...caps, cap]
                                  : caps.filter((c) => c !== cap),
                              });
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>

                  <Input
                    label="Repository URL"
                    placeholder="https://github.com/..."
                    hint="Link to the source code repository"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <Alert variant="info">
                    Please review your submission. After submitting, our team
                    will review it within 1-2 business days.
                  </Alert>

                  <div className="space-y-4">
                    <div className="flex justify-between border-b border-border py-2">
                      <span className="text-body-sm text-content-tertiary">
                        Name
                      </span>
                      <span className="text-body-sm font-medium text-content-primary">
                        {formData.name}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border py-2">
                      <span className="text-body-sm text-content-tertiary">
                        Slug
                      </span>
                      <span className="font-mono text-body-sm text-content-primary">
                        {formData.slug}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border py-2">
                      <span className="text-body-sm text-content-tertiary">
                        Transport
                      </span>
                      <span className="text-body-sm text-content-primary">
                        {formData.transport}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-border py-2">
                      <span className="text-body-sm text-content-tertiary">
                        Tags
                      </span>
                      <div className="flex gap-1">
                        {formData.tags?.map((tag) => (
                          <Badge key={tag} size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Checkbox
                    label="I confirm this submission is accurate"
                    description="I understand that submitting inaccurate information may result in rejection"
                  />
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <Button
                  variant="ghost"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                >
                  Back
                </Button>

                {step < 2 ? (
                  <Button onClick={() => setStep(step + 1)}>Continue</Button>
                ) : (
                  <Button>Submit for Review</Button>
                )}
              </div>
            </Card>
          </main>

          {/* Preview Sidebar */}
          <aside className="lg:col-span-2">
            <div className="sticky top-4">
              <PreviewCard data={formData} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
```

---

### 4. /my/submissions — User's Submissions

```tsx
// app/my/submissions/page.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Toast";

// Status Timeline Component
function StatusTimeline({
  status,
  events,
}: {
  status: string;
  events: StatusEvent[];
}) {
  const statusConfig = {
    pending: { color: "bg-amber-500", label: "Pending Review" },
    in_review: { color: "bg-blue-500", label: "In Review" },
    invalid: { color: "bg-red-500", label: "Invalid" },
    rejected: { color: "bg-red-500", label: "Rejected" },
    approved: { color: "bg-green-500", label: "Approved" },
  };

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute bottom-3 left-2 top-3 w-0.5 bg-border" />

      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start gap-3">
            <div
              className={cn(
                "z-10 h-4 w-4 rounded-full border-2 border-surface-secondary",
                index === 0
                  ? statusConfig[event.status]?.color || "bg-neutral-400"
                  : "bg-border"
              )}
            />
            <div className="min-w-0 flex-1 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-content-primary">
                  {event.title}
                </span>
                <span className="text-caption text-content-tertiary">
                  {formatDate(event.date)}
                </span>
              </div>
              {event.message && (
                <p className="mt-1 text-body-sm text-content-secondary">
                  {event.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validation Error Display
function ValidationErrors({ errors }: { errors: ValidationError[] }) {
  return (
    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
      <h4 className="mb-2 flex items-center gap-2 text-body-sm font-medium text-red-700 dark:text-red-400">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        Validation Errors
      </h4>
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li
            key={index}
            className="flex items-start gap-2 text-body-sm text-red-600 dark:text-red-400"
          >
            <span className="font-mono text-caption text-content-tertiary">
              {error.field}:
            </span>
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Submission Card
function SubmissionCard({ submission }: { submission: Submission }) {
  const statusBadges = {
    pending: { variant: "warning" as const, label: "Pending", dot: true },
    in_review: { variant: "info" as const, label: "In Review", dot: true },
    invalid: { variant: "error" as const, label: "Invalid", dot: true },
    rejected: { variant: "error" as const, label: "Rejected", dot: false },
    approved: { variant: "success" as const, label: "Approved", dot: false },
  };

  const badge = statusBadges[submission.status];

  return (
    <Card padding="md" className="group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 font-semibold text-content-secondary dark:from-neutral-800 dark:to-neutral-700">
            {submission.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-heading-md text-content-primary">
              {submission.name}
            </h3>
            <p className="text-caption text-content-tertiary">
              Submitted {formatDate(submission.submittedAt)}
            </p>
          </div>
        </div>
        <Badge variant={badge.variant} dot={badge.dot}>
          {badge.label}
        </Badge>
      </div>

      {/* Show timeline for expanded view */}
      <details className="mt-4 group-open:mt-4">
        <summary className="cursor-pointer text-body-sm text-brand-600 hover:text-brand-700">
          View history
        </summary>
        <div className="mt-4 border-l-2 border-border pl-4">
          <StatusTimeline
            status={submission.status}
            events={submission.events}
          />
        </div>
      </details>

      {/* Validation Errors */}
      {submission.status === "invalid" && submission.validationErrors && (
        <ValidationErrors errors={submission.validationErrors} />
      )}

      {/* Rejection Note */}
      {submission.status === "rejected" && submission.rejectionNote && (
        <Alert variant="error" className="mt-4">
          <strong>Rejection reason:</strong> {submission.rejectionNote}
        </Alert>
      )}

      {/* Actions */}
      {(submission.status === "invalid" ||
        submission.status === "rejected") && (
        <div className="mt-4 flex gap-2 border-t border-border pt-4">
          <Button variant="primary" size="sm">
            Edit & Resubmit
          </Button>
          <Button variant="ghost" size="sm">
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function MySubmissionsPage() {
  const submissions = getUserSubmissions(); // Your data fetching

  return (
    <div className="min-h-screen bg-surface-primary">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-md text-content-primary">
              My Submissions
            </h1>
            <p className="mt-1 text-body-md text-content-secondary">
              Track and manage your server submissions
            </p>
          </div>
          <Button href="/submit">
            <PlusIcon className="h-4 w-4" />
            New Submission
          </Button>
        </header>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-surface-sunken p-1">
          {["All", "Pending", "Approved", "Needs Attention"].map((tab) => (
            <button
              key={tab}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-body-sm font-medium transition-colors",
                tab === "All"
                  ? "bg-surface-secondary text-content-primary shadow-sm"
                  : "text-content-secondary hover:text-content-primary"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Submissions List */}
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <SubmissionCard key={submission.id} submission={submission} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<InboxIcon className="h-6 w-6" />}
            title="No submissions yet"
            description="Submit your first MCP server to get started"
            action={{
              label: "Submit a Server",
              onClick: () => router.push("/submit"),
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

### 5. /admin/submissions — Admin Review Queue

```tsx
// app/admin/submissions/page.tsx
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Table } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Toast";

// Diff-like Display for Schema Comparison
function SchemaDiff({
  submitted,
  normalized,
  errors,
}: {
  submitted: Record<string, any>;
  normalized: Record<string, any>;
  errors: ValidationError[];
}) {
  const allKeys = [
    ...new Set([...Object.keys(submitted), ...Object.keys(normalized)]),
  ];

  return (
    <div className="overflow-hidden rounded-lg border border-border font-mono text-mono-sm">
      <div className="grid grid-cols-2">
        <div className="border-b border-r border-border bg-red-50 px-3 py-2 dark:bg-red-900/20">
          <span className="text-caption font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
            Submitted
          </span>
        </div>
        <div className="border-b border-border bg-green-50 px-3 py-2 dark:bg-green-900/20">
          <span className="text-caption font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
            Normalized
          </span>
        </div>
      </div>

      {allKeys.map((key) => {
        const hasError = errors.some((e) => e.field === key);
        const isDifferent =
          JSON.stringify(submitted[key]) !== JSON.stringify(normalized[key]);

        return (
          <div
            key={key}
            className={cn(
              "grid grid-cols-2 border-b border-border last:border-0",
              hasError && "bg-red-50/50 dark:bg-red-900/10"
            )}
          >
            <div className="border-r border-border px-3 py-2">
              <span className="text-content-tertiary">{key}: </span>
              <span
                className={cn(
                  isDifferent
                    ? "text-red-600 dark:text-red-400"
                    : "text-content-primary"
                )}
              >
                {JSON.stringify(submitted[key]) ?? "undefined"}
              </span>
            </div>
            <div className="px-3 py-2">
              <span className="text-content-tertiary">{key}: </span>
              <span
                className={cn(
                  isDifferent
                    ? "text-green-600 dark:text-green-400"
                    : "text-content-primary"
                )}
              >
                {JSON.stringify(normalized[key]) ?? "undefined"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Review Detail Panel
function ReviewPanel({
  submission,
  onApprove,
  onReject,
  onClose,
}: {
  submission: Submission;
  onApprove: (note: string) => void;
  onReject: (note: string) => void;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-border bg-surface-secondary shadow-elevated">
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-secondary px-6 py-4">
        <h2 className="text-heading-lg text-content-primary">
          Review Submission
        </h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-surface-sunken"
        >
          <XIcon className="h-5 w-5 text-content-tertiary" />
        </button>
      </div>

      <div className="space-y-6 p-6">
        {/* Server Info */}
        <Card padding="md">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-heading-lg font-semibold text-brand-600 dark:from-brand-900 dark:to-brand-800 dark:text-brand-400">
              {submission.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-heading-md text-content-primary">
                {submission.name}
              </h3>
              <p className="font-mono text-body-sm text-content-tertiary">
                {submission.slug}
              </p>
              <p className="mt-2 text-body-sm text-content-secondary">
                {submission.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Validation Errors */}
        {submission.validationErrors &&
          submission.validationErrors.length > 0 && (
            <Alert variant="error" title="Validation Errors">
              <ul className="mt-2 list-inside list-disc space-y-1">
                {submission.validationErrors.map((error, i) => (
                  <li key={i}>
                    <span className="font-mono text-caption">
                      {error.field}
                    </span>
                    : {error.message}
                  </li>
                ))}
              </ul>
            </Alert>
          )}

        {/* Schema Diff */}
        <div>
          <h3 className="mb-3 text-heading-sm text-content-primary">
            Schema Comparison
          </h3>
          <SchemaDiff
            submitted={submission.submittedData}
            normalized={submission.normalizedData}
            errors={submission.validationErrors || []}
          />
        </div>

        {/* Metadata */}
        <div>
          <h3 className="mb-3 text-heading-sm text-content-primary">
            Metadata
          </h3>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-caption text-content-tertiary">Transport</dt>
              <dd className="text-body-sm text-content-primary">
                {submission.transport}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-content-tertiary">Auth</dt>
              <dd className="text-body-sm text-content-primary">
                {submission.auth || "None"}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-content-tertiary">
                Submitted By
              </dt>
              <dd className="text-body-sm text-content-primary">
                {submission.submittedBy}
              </dd>
            </div>
            <div>
              <dt className="text-caption text-content-tertiary">
                Submitted At
              </dt>
              <dd className="text-body-sm text-content-primary">
                {formatDate(submission.submittedAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Admin Note */}
        <div>
          <label className="mb-2 block text-body-sm font-medium text-content-primary">
            Review Note
          </label>
          <textarea
            rows={3}
            placeholder="Add a note for the submitter (required for rejection)..."
            className="w-full resize-none rounded-lg border border-border bg-surface-primary px-3 py-2 text-content-primary placeholder:text-content-tertiary focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </div>

      {/* Actions Footer */}
      <div className="sticky bottom-0 flex gap-3 border-t border-border bg-surface-secondary px-6 py-4">
        <Button
          variant="danger"
          className="flex-1"
          onClick={() => onReject(note)}
          disabled={!note.trim()}
        >
          Reject
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          onClick={() => onApprove(note)}
        >
          Approve
        </Button>
      </div>
    </div>
  );
}

// Queue Row
function QueueRow({
  submission,
  onClick,
  selected,
}: {
  submission: Submission;
  onClick: () => void;
  selected: boolean;
}) {
  const statusBadges = {
    pending: { variant: "warning" as const, label: "Pending" },
    in_review: { variant: "info" as const, label: "In Review" },
    invalid: { variant: "error" as const, label: "Invalid" },
  };

  const badge = statusBadges[submission.status] || statusBadges.pending;
  const hasErrors =
    submission.validationErrors && submission.validationErrors.length > 0;

  return (
    <Table.Row
      onClick={onClick}
      className={cn(
        "cursor-pointer",
        selected && "bg-brand-50 dark:bg-brand-900/20"
      )}
    >
      <Table.Cell>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-neutral-100 to-neutral-200 text-body-sm font-semibold text-content-secondary dark:from-neutral-800 dark:to-neutral-700">
            {submission.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-body-sm font-medium text-content-primary">
              {submission.name}
            </p>
            <p className="font-mono text-caption text-content-tertiary">
              {submission.slug}
            </p>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        <span className="text-body-sm text-content-secondary">
          {submission.submittedBy}
        </span>
      </Table.Cell>
      <Table.Cell>
        <span className="text-body-sm text-content-tertiary">
          {formatRelativeTime(submission.submittedAt)}
        </span>
      </Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-2">
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
          {hasErrors && (
            <span
              className="h-2 w-2 rounded-full bg-red-500"
              title="Has validation errors"
            />
          )}
        </div>
      </Table.Cell>
      <Table.Cell align="right">
        <ChevronRightIcon className="h-4 w-4 text-content-tertiary" />
      </Table.Cell>
    </Table.Row>
  );
}

export default function AdminSubmissionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const submissions = getAdminSubmissions(); // Your data fetching
  const selectedSubmission = submissions.find((s) => s.id === selectedId);

  return (
    <div className="min-h-screen bg-surface-primary">
      <div
        className={cn(
          "transition-all duration-300",
          selectedId ? "mr-[40rem]" : ""
        )}
      >
        <div className="mx-auto max-w-5xl px-4 py-12">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-display-md text-content-primary">
                Review Queue
              </h1>
              <p className="mt-1 text-body-md text-content-secondary">
                {submissions.length} submissions awaiting review
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                placeholder="Search submissions..."
                className="w-64"
                icon={<SearchIcon className="h-4 w-4" />}
              />
            </div>
          </header>

          {/* Filter Tabs */}
          <div className="mb-6 flex items-center gap-4">
            <div className="flex gap-1 rounded-lg bg-surface-sunken p-1">
              {["All", "Pending", "Invalid"].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-body-sm font-medium transition-colors",
                    tab === "All"
                      ? "bg-surface-secondary text-content-primary shadow-sm"
                      : "text-content-secondary hover:text-content-primary"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-body-sm text-content-tertiary">
              <span>Sort:</span>
              <select className="bg-transparent font-medium text-content-primary">
                <option>Oldest first</option>
                <option>Newest first</option>
                <option>Has errors</option>
              </select>
            </div>
          </div>

          {/* Queue Table */}
          <Card padding="none">
            <Table>
              <Table.Head>
                <Table.Row hoverable={false}>
                  <Table.HeaderCell>Server</Table.HeaderCell>
                  <Table.HeaderCell>Submitted By</Table.HeaderCell>
                  <Table.HeaderCell>When</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Head>
              <Table.Body>
                {submissions.map((submission) => (
                  <QueueRow
                    key={submission.id}
                    submission={submission}
                    onClick={() => setSelectedId(submission.id)}
                    selected={selectedId === submission.id}
                  />
                ))}
              </Table.Body>
            </Table>
          </Card>
        </div>
      </div>

      {/* Review Panel */}
      {selectedSubmission && (
        <ReviewPanel
          submission={selectedSubmission}
          onApprove={(note) => {
            // Handle approve
            setSelectedId(null);
          }}
          onReject={(note) => {
            // Handle reject
            setSelectedId(null);
          }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
```

---

## F) Accessibility & Responsiveness Checklist

### Keyboard Navigation

- [ ] All interactive elements are focusable with Tab
- [ ] Focus order follows visual flow (logical tab index)
- [ ] Escape closes modals/panels
- [ ] Arrow keys navigate within component groups (tabs, menus)
- [ ] Enter/Space activates buttons and links
- [ ] Skip links to main content on every page

### Focus States

```css
/* Global focus style */
*:focus-visible {
  @apply outline-none ring-2 ring-brand-500 ring-offset-2;
}

/* For dark backgrounds */
.dark *:focus-visible {
  @apply ring-offset-neutral-900;
}
```

### Contrast Guidance

| Element        | Light Mode         | Dark Mode          | WCAG Level |
| -------------- | ------------------ | ------------------ | ---------- |
| Body text      | #1c1917 on #fafaf9 | #f5f5f4 on #0c0a09 | AAA        |
| Secondary text | #57534e on #fafaf9 | #a8a29e on #0c0a09 | AA         |
| Brand on white | #0d9488 on #ffffff | N/A                | AA         |
| Error text     | #dc2626 on #fef2f2 | #f87171 on #450a0a | AA         |

### ARIA Patterns

- Tables have proper `<thead>`, `<th>` scope attributes
- Forms have associated labels (explicit or `aria-label`)
- Loading states announced with `aria-live="polite"`
- Modal/panel uses `role="dialog"` with `aria-modal="true"`
- Status badges have `aria-label` for screen readers

### Mobile Layout Decisions

| Breakpoint          | Layout Changes                                                     |
| ------------------- | ------------------------------------------------------------------ |
| < 640px (mobile)    | Single column, stacked cards, collapsible filters, full-width CTAs |
| 640-1024px (tablet) | 2-column card grid, sidebar filters collapse to modal              |
| > 1024px (desktop)  | 3-column layout with persistent filter sidebar                     |

**Key mobile patterns:**

- Filter sidebar → Bottom sheet modal
- Table rows → Cards with stacked layout
- Admin review panel → Full-screen overlay
- Pagination → Simplified with prev/next only

---

## G) Implementation Plan

### Phase 1: Foundation (Week 1)

- [ ] Set up Tailwind config with design tokens
- [ ] Create CSS variables for theming
- [ ] Add custom fonts (Söhne fallback to system)
- [ ] Implement utility function (`cn` for class merging)
- [ ] Create base components:
  - [ ] Button
  - [ ] Input
  - [ ] Select
  - [ ] Checkbox
  - [ ] Badge

### Phase 2: Core Components (Week 2)

- [ ] Card (with subcomponents)
- [ ] Table / ListRow
- [ ] Pagination
- [ ] Toast / Alert
- [ ] EmptyState
- [ ] Skeleton
- [ ] Breadcrumbs

### Phase 3: Page - Server Browse (Week 2-3)

- [ ] ServerCard component
- [ ] VerifiedBadge
- [ ] FilterChip
- [ ] Filter sidebar
- [ ] Search header
- [ ] Mobile responsive layout
- [ ] Connect to data layer

### Phase 4: Page - Server Detail (Week 3)

- [ ] InstallCommand with copy
- [ ] MetadataItem
- [ ] Capability cards
- [ ] Sidebar quick actions
- [ ] Trust/ownership placeholders

### Phase 5: Page - Submit Form (Week 4)

- [ ] Multi-step form logic
- [ ] FormProgress indicator
- [ ] TagInput component
- [ ] PreviewCard (live preview)
- [ ] Form validation integration

### Phase 6: Page - My Submissions (Week 4)

- [ ] StatusTimeline
- [ ] ValidationErrors display
- [ ] SubmissionCard
- [ ] Filter tabs
- [ ] Edit/resubmit flow

### Phase 7: Page - Admin Queue (Week 5)

- [ ] QueueRow
- [ ] SchemaDiff component
- [ ] ReviewPanel (slide-over)
- [ ] Approve/reject actions
- [ ] Keyboard navigation

### Phase 8: Polish & QA (Week 5-6)

- [ ] Dark mode testing
- [ ] Mobile responsive testing
- [ ] Accessibility audit (axe, keyboard nav)
- [ ] Performance optimization (code splitting)
- [ ] Animation refinement

---

## H) Component Reuse Matrix

| Component     | /servers | /servers/[slug] | /submit | /my/submissions | /admin |
| ------------- | -------- | --------------- | ------- | --------------- | ------ |
| Button        | ✓        | ✓               | ✓       | ✓               | ✓      |
| Input         | ✓        |                 | ✓       |                 | ✓      |
| Select        | ✓        |                 | ✓       |                 | ✓      |
| Badge         | ✓        | ✓               | ✓       | ✓               | ✓      |
| Card          | ✓        | ✓               | ✓       | ✓               | ✓      |
| Table         |          |                 |         |                 | ✓      |
| Pagination    | ✓        |                 |         |                 |        |
| Toast/Alert   |          |                 | ✓       | ✓               | ✓      |
| EmptyState    | ✓        |                 |         | ✓               | ✓      |
| Skeleton      | ✓        | ✓               |         | ✓               | ✓      |
| Breadcrumbs   |          | ✓               |         |                 |        |
| ServerCard    | ✓        |                 |         |                 |        |
| VerifiedBadge | ✓        | ✓               |         |                 |        |

---

This design system provides a complete foundation for the MCP Registry redesign. The "Precision Trust" aesthetic emphasizes clarity and credibility while maintaining visual interest through thoughtful typography, spacing, and subtle color accents. The component library is built for reuse and the implementation plan provides a clear path to production.
