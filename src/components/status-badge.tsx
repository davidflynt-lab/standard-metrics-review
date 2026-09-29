import type { Status } from "@/lib/review";
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`status status-${status.toLowerCase().replaceAll(" ", "-")}`}
    >
      {status}
    </span>
  );
}
