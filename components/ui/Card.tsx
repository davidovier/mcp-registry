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

function CardHeader({
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
}

function CardTitle({
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
}

function CardDescription({
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
}

function CardFooter({
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
}

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Footer = CardFooter;
