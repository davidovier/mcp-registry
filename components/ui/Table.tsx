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

function TableHead({ children, className }: TableProps) {
  return (
    <thead className={cn("border-b border-border", className)}>
      {children}
    </thead>
  );
}

function TableBody({ children, className }: TableProps) {
  return <tbody className={className}>{children}</tbody>;
}

function TableRow({
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
}

function TableHeaderCell({
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
}

function TableCell({
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
}

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;

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
