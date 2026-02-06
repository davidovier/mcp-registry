import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

interface MetadataCardProps {
  transport: string;
  auth: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MetadataCard({
  transport,
  auth,
  verified,
  createdAt,
  updatedAt,
}: MetadataCardProps) {
  return (
    <Card padding="md">
      <h3 className="mb-2 text-heading-sm text-content-primary">Details</h3>
      <dl>
        <MetadataItem
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          }
          label="Transport"
          value={
            <Badge variant="default" size="sm">
              {transport}
            </Badge>
          }
        />
        <MetadataItem
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          }
          label="Authentication"
          value={
            <Badge variant="default" size="sm">
              {auth}
            </Badge>
          }
        />
        <MetadataItem
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          }
          label="Verified"
          value={
            <span className="text-body-md text-content-primary">
              {verified ? "Yes" : "No"}
            </span>
          }
        />
        <MetadataItem
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          }
          label="Added"
          value={
            <span className="text-body-md text-content-primary">
              {formatDate(createdAt)}
            </span>
          }
        />
        <MetadataItem
          icon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M4.031 9.865"
              />
            </svg>
          }
          label="Updated"
          value={
            <span className="text-body-md text-content-primary">
              {formatDate(updatedAt)}
            </span>
          }
          isLast
        />
      </dl>
    </Card>
  );
}

function MetadataItem({
  icon,
  label,
  value,
  isLast = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 py-3 ${isLast ? "" : "border-b border-border"}`}
    >
      <div className="mt-0.5 flex-shrink-0 text-content-tertiary">{icon}</div>
      <div>
        <dt className="text-caption uppercase tracking-wide text-content-tertiary">
          {label}
        </dt>
        <dd className="mt-0.5">{value}</dd>
      </div>
    </div>
  );
}
