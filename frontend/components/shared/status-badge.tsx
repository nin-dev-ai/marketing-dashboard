import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/lib/types";

const STATUS_STYLES: Record<string, { bg: string; dot: string }> = {
  Draft: {
    bg: "bg-status-grey-bg text-status-grey-fg",
    dot: "bg-status-grey-fg",
  },
  "In Progress": {
    bg: "bg-status-yellow-bg text-status-yellow-fg",
    dot: "bg-status-yellow-fg",
  },
  "Ready to Send": {
    bg: "bg-status-green-bg text-status-green-fg",
    dot: "bg-status-green-fg",
  },
  Sent: {
    bg: "bg-status-blue-bg text-status-blue-fg",
    dot: "bg-status-blue-fg",
  },
  Paused: {
    bg: "bg-status-purple-bg text-status-purple-fg",
    dot: "bg-status-purple-fg",
  },
  Completed: {
    bg: "bg-status-green-bg text-status-green-fg",
    dot: "bg-status-green-fg",
  },
};

interface StatusBadgeProps {
  status: CampaignStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.bg,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      {status}
    </span>
  );
}
