"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Mail,
  Plus,
  Sparkles,
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { RecentCampaignsTable } from "@/components/dashboard/recent-campaigns-table";
import { TopOpportunities } from "@/components/dashboard/top-opportunities";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  KpiRowSkeleton,
  ListSkeleton,
  TableSkeleton,
} from "@/components/shared/loading-skeletons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getDashboard } from "@/lib/api";
import type { DashboardData } from "@/lib/types";

type ViewState =
  | { status: "loading" }
  | { status: "success"; data: DashboardData }
  | { status: "error"; message: string };

export default function DashboardPage() {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const data = await getDashboard(signal);
      if (signal?.aborted) return;
      setState({ status: "success", data });
    } catch (err) {
      if (signal?.aborted) return;
      setState({
        status: "error",
        message:
          err instanceof Error
            ? err.message
            : "Could not load dashboard from API / Postgres",
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening with your outreach."
        action={
          <Button asChild>
            <Link href="/dream-companies/new">
              <Plus className="h-4 w-4" />
              Add Dream Company
            </Link>
          </Button>
        }
      />

      {state.status === "loading" ? (
        <DashboardLoading />
      ) : state.status === "error" ? (
        <div className="rounded-xl border border-status-red-fg/20 bg-status-red-bg/40 px-4 py-3 text-sm text-status-red-fg">
          {state.message}. Start the backend and Postgres, then refresh.
        </div>
      ) : (
        <DashboardContent data={state.data} />
      )}
    </>
  );
}

function DashboardContent({ data }: { data: DashboardData }) {
  const { kpis, recent_campaigns, top_opportunities, activity_feed } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Dream Companies"
          value={kpis.dream_companies}
          icon={Building2}
          tone="green"
          caption="From Postgres dream list"
        />
        <KpiCard
          label="Opportunities"
          value={kpis.opportunities}
          icon={Sparkles}
          tone="yellow"
          caption="AI-surfaced signals"
        />
        <KpiCard
          label="Emails Generated"
          value={kpis.emails_generated}
          icon={Mail}
          tone="purple"
          caption="Across all campaigns"
        />
        <KpiCard
          label="Ready to Send"
          value={kpis.ready_to_send}
          icon={CheckCircle2}
          tone="blue"
          caption="Approved drafts"
        />
      </div>

      <RecentCampaignsTable campaigns={recent_campaigns} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopOpportunities opportunities={top_opportunities} />
        <ActivityFeed items={activity_feed} />
      </div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <KpiRowSkeleton />
      <Card>
        <TableSkeleton rows={5} />
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <ListSkeleton rows={5} />
        </Card>
        <Card>
          <ListSkeleton rows={5} />
        </Card>
      </div>
    </div>
  );
}
