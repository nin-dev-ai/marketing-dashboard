import * as React from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";

type Tone = "green" | "yellow" | "blue" | "purple" | "red";

const TONE_STYLES: Record<Tone, string> = {
  green: "bg-status-green-bg text-status-green-fg",
  yellow: "bg-status-yellow-bg text-status-yellow-fg",
  blue: "bg-status-blue-bg text-status-blue-fg",
  purple: "bg-status-purple-bg text-status-purple-fg",
  red: "bg-status-red-bg text-status-red-fg",
};

export interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: Tone;
  /** e.g. "+12% MoM" or "3 new" — small caption under the value. */
  caption?: string;
  /** Optional delta indicator. Positive = up arrow, negative = down arrow. */
  delta?: number;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "green",
  caption,
  delta,
  className,
}: KpiCardProps) {
  const display = typeof value === "number" ? formatNumber(value) : value;
  const isPositive = (delta ?? 0) >= 0;

  return (
    <Card className={cn("flex items-start gap-4 p-5", className)}>
      <span
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
          TONE_STYLES[tone],
        )}
        aria-hidden
      >
        <Icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[28px] font-semibold leading-none tracking-tight text-foreground">
            {display}
          </span>
          {typeof delta === "number" ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-status-green-fg" : "text-status-red-fg",
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {Math.abs(delta)}%
            </span>
          ) : null}
        </div>
        {caption ? (
          <p className="mt-1 text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </div>
    </Card>
  );
}
