import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

interface Props {
  items: ActivityItem[];
}

export function ActivityFeed({ items }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">Activity Feed</CardTitle>
        <button
          type="button"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </button>
      </CardHeader>
      <CardContent className="space-y-1 px-3 pb-3 pt-0">
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No recent activity.
          </p>
        ) : (
          items.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-lg px-3 py-2"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-status-green-bg text-status-green-fg">
                <Activity className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1 leading-snug">
                <p className="text-sm text-foreground">{a.message}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatRelativeTime(a.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
