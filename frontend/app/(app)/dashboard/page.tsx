"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Info,
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
import { getMockDashboard } from "@/lib/mock-dashboard";
import type { DashboardData } from "@/lib/types";

type DataSource = "live" | "demo";

type ViewState =
  | { status: "loading" }
  | { status: "success"; data: DashboardData; source: DataSource };

export default function DashboardPage() {
  const [state, setState] = useState<ViewState>({ status: "loading" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setState({ status: "loading" });
    try {
      const data = await getDashboard(signal);
      if (signal?.aborted) return;
      setState({ status: "success", data, source: "live" });
    } catch {
      if (signal?.aborted) return;
      // Backend isn't running yet — fall back to demo data so the screen
      // still renders. Once the FastAPI service is up, the live branch
      // takes over automatically.
      setState({
        status: "success",
        data: getMockDashboard(),
        source: "demo",
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
      ) : (
        <DashboardContent data={state.data} source={state.source} />
      )}
    </>
  );
}

function DemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-status-yellow-fg/15 bg-status-yellow-bg/60 px-4 py-3 text-sm text-status-yellow-fg">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="leading-snug">
        <span className="font-medium">Showing demo data.</span>{" "}
        <span className="text-status-yellow-fg/90">
          The Emitly backend isn&apos;t reachable on{" "}
          <code className="rounded bg-card/70 px-1 py-0.5 font-mono text-[11px]">
            {process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}
          </code>
          . Live data will load automatically once it&apos;s running.
        </span>
      </div>
    </div>
  );
}

function DashboardContent({
  data,
  source,
}: {
  data: DashboardData;
  source: DataSource;
}) {
  const { kpis, recent_campaigns, top_opportunities, activity_feed } = data;

  return (
    <div className="space-y-6">
      {source === "demo" ? <DemoBanner /> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Dream Companies"
          value={kpis.dream_companies}
          icon={Building2}
          tone="green"
          caption="Active targets"
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
