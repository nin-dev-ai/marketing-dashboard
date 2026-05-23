import Link from "next/link";

import { ScoreBadge } from "@/components/shared/score-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import type { TopOpportunity } from "@/lib/types";

interface Props {
  opportunities: TopOpportunity[];
}

export function TopOpportunities({ opportunities }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">Top Opportunities</CardTitle>
        <Link
          href="/dream-companies"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="space-y-1 px-3 pb-3 pt-0">
        {opportunities.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No opportunities yet.
          </p>
        ) : (
          opportunities.map((o) => (
            <Link
              key={o.id}
              href={`/intelligence/${o.id.replace(/^opp_/, "")}`}
              className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold uppercase text-primary">
                {getInitials(o.company)}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-sm font-medium text-foreground">
                  {o.company}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {o.industry}
                </p>
              </div>
              <ScoreBadge score={o.opportunity_score} />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
