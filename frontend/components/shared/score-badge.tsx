import { cn } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

/**
 * Coloured opportunity score pill.
 *  >= 85 → green (strong),
 *  >= 70 → blue (good),
 *  >= 55 → yellow (warm),
 *  else  → red  (weak).
 */
export function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const tone =
    score >= 85
      ? "bg-status-green-bg text-status-green-fg"
      : score >= 70
        ? "bg-status-blue-bg text-status-blue-fg"
        : score >= 55
          ? "bg-status-yellow-bg text-status-yellow-fg"
          : "bg-status-red-bg text-status-red-fg";

  return (
    <span
      className={cn(
        "inline-flex min-w-[40px] items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
        tone,
        className,
      )}
      aria-label={`Opportunity score ${score}`}
    >
      {score}
    </span>
  );
}
