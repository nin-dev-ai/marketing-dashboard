"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  approveCampaignDecision,
  dismissCampaignDecision,
  getPendingDecisions,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import type { CampaignDecision } from "@/lib/types";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [decisions, setDecisions] = useState<CampaignDecision[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await getPendingDecisions(signal);
      if (!signal?.aborted) setDecisions(data);
    } catch {
      if (!signal?.aborted) setDecisions([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    const interval = setInterval(() => void load(), 60_000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [load]);

  async function handleApprove(decisionId: string) {
    try {
      await approveCampaignDecision(decisionId);
      toast.success("Campaign approved — agent will queue outreach");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed");
    }
  }

  async function handleDismiss(decisionId: string) {
    try {
      await dismissCampaignDecision(decisionId);
      toast.success("Decision dismissed");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Dismiss failed");
    }
  }

  const count = decisions.length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-[18px] w-[18px]" />
        {count > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-card">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-transparent"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,380px)] rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-foreground">
                Campaign decisions
              </p>
              <p className="text-xs text-muted-foreground">
                Weekly reviews waiting for your decision
              </p>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {loading ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Loading…
                </p>
              ) : count === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No pending reviews. When a 7-day window completes, decisions
                  appear here if campaign mode is set to notify.
                </p>
              ) : (
                decisions.map((d) => (
                  <div
                    key={d.decision_id}
                    className="border-b border-border px-4 py-3 last:border-b-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {d.company_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Score {d.opportunity_score} · 7-day window complete
                        </p>
                        {d.weekly_summary ? (
                          <p className="mt-1 line-clamp-2 text-xs text-foreground">
                            {d.weekly_summary}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handleApprove(d.decision_id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Start campaign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 flex-1 text-xs"
                        onClick={() => void handleDismiss(d.decision_id)}
                      >
                        <X className="h-3.5 w-3.5" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-border px-4 py-2">
              <Link
                href="/jobs"
                onClick={() => setOpen(false)}
                className={cn(
                  "block text-center text-xs font-medium text-primary hover:underline",
                )}
              >
                Open Jobs settings
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
