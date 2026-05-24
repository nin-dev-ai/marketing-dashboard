"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Building2,
  Filter,
  Globe,
  LayoutGrid,
  Mail,
  MapPin,
  Plus,
  Radar,
  Search,
  Sparkles,
  Table as TableIcon,
  Target,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDreamCompanies, setDreamCompanyMonitoring } from "@/lib/api";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { DreamCompany, DreamCompanyStatus } from "@/lib/types";

const STATUS_STYLE: Record<DreamCompanyStatus, { bg: string; dot: string }> = {
  New: {
    bg: "bg-status-grey-bg text-status-grey-fg",
    dot: "bg-status-grey-fg",
  },
  Researching: {
    bg: "bg-status-yellow-bg text-status-yellow-fg",
    dot: "bg-status-yellow-fg",
  },
  "Intelligence Ready": {
    bg: "bg-status-blue-bg text-status-blue-fg",
    dot: "bg-status-blue-fg",
  },
  "Active Campaign": {
    bg: "bg-status-green-bg text-status-green-fg",
    dot: "bg-status-green-fg",
  },
  Sent: {
    bg: "bg-status-purple-bg text-status-purple-fg",
    dot: "bg-status-purple-fg",
  },
  Archived: {
    bg: "bg-status-grey-bg text-status-grey-fg",
    dot: "bg-status-grey-fg",
  },
};

const STATUS_FILTERS: (DreamCompanyStatus | "All")[] = [
  "All",
  "New",
  "Researching",
  "Intelligence Ready",
  "Active Campaign",
];

export default function DreamCompaniesPage() {
  const [companies, setCompanies] = useState<DreamCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DreamCompanyStatus | "All">(
    "All",
  );
  const [view, setView] = useState<"grid" | "table">("grid");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleMonitoringToggle = useCallback(
    async (companyId: string, enabled: boolean) => {
      setTogglingId(companyId);
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId ? { ...c, monitoring_enabled: enabled } : c,
        ),
      );
      try {
        const updated = await setDreamCompanyMonitoring(companyId, enabled);
        setCompanies((prev) =>
          prev.map((c) => (c.id === companyId ? updated : c)),
        );
        toast.success(
          enabled
            ? "Monitoring enabled — company included in daily scans"
            : "Monitoring disabled",
        );
      } catch (err) {
        setCompanies((prev) =>
          prev.map((c) =>
            c.id === companyId ? { ...c, monitoring_enabled: !enabled } : c,
          ),
        );
        toast.error(err instanceof Error ? err.message : "Could not update monitoring");
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDreamCompanies(signal);
      if (signal?.aborted) return;
      setCompanies(data);
    } catch (err) {
      if (signal?.aborted) return;
      setError(
        err instanceof Error
          ? err.message
          : "Could not load dream companies from Postgres",
      );
      setCompanies([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return companies.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay =
        `${c.name} ${c.industry} ${c.country} ${c.last_signal ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [companies, query, statusFilter]);

  const kpis = useMemo(() => {
    return {
      total: companies.length,
      intelligence: companies.filter((c) =>
        ["Intelligence Ready", "Active Campaign", "Sent"].includes(c.status),
      ).length,
      active: companies.filter((c) => c.status === "Active Campaign").length,
      monitoring: companies.filter((c) => c.monitoring_enabled).length,
      avgScore: Math.round(
        companies.reduce((acc, c) => acc + c.opportunity_score, 0) /
          (companies.length || 1),
      ),
    };
  }, [companies]);

  return (
    <>
      <PageHeader
        title="Dream Companies"
        subtitle="Turn monitoring on for companies you want included in daily news scans. Configure schedule in Jobs."
        action={
          <Button asChild>
            <Link href="/dream-companies/new">
              <Plus className="h-4 w-4" />
              Add Dream Company
            </Link>
          </Button>
        }
      />

      {error ? (
        <p className="mb-6 rounded-xl border border-status-red-fg/20 bg-status-red-bg/40 px-4 py-3 text-sm text-status-red-fg">
          {error}. Ensure Postgres is running and DATABASE_URL is set in backend/.env.
        </p>
      ) : null}

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading companies from Postgres…
        </p>
      ) : (
        <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <KpiCard
          label="Total Companies"
          value={kpis.total}
          icon={Building2}
          tone="green"
          caption="On your dream list"
        />
        <KpiCard
          label="Intelligence Ready"
          value={kpis.intelligence}
          icon={Sparkles}
          tone="blue"
          caption="AI brief generated"
        />
        <KpiCard
          label="Active Campaigns"
          value={kpis.active}
          icon={Mail}
          tone="purple"
          caption="Outreach in flight"
        />
        <KpiCard
          label="Monitoring On"
          value={kpis.monitoring}
          icon={Radar}
          tone="green"
          caption="Included in daily scans"
        />
        <KpiCard
          label="Avg Opportunity"
          value={kpis.avgScore}
          icon={Target}
          tone="yellow"
          caption="Across all targets"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">All Dream Companies</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search companies and industries…"
                className="h-9 w-[280px] rounded-md pl-9"
              />
            </div>
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
              <Filter className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-xs font-medium transition-colors",
                    statusFilter === s
                      ? "bg-primary-100 text-primary-700"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center rounded-md border border-border bg-card p-0.5">
              <ViewToggle
                active={view === "grid"}
                onClick={() => setView("grid")}
                label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </ViewToggle>
              <ViewToggle
                active={view === "table"}
                onClick={() => setView("table")}
                label="Table view"
              >
                <TableIcon className="h-4 w-4" />
              </ViewToggle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("p-0", view === "grid" && "p-5")}>
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No companies match your filters.
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => (
                <CompanyCard
                  key={c.id}
                  company={c}
                  onMonitoringChange={handleMonitoringToggle}
                  toggling={togglingId === c.id}
                />
              ))}
            </div>
          ) : (
            <CompanyTable
              rows={filtered}
              onMonitoringChange={handleMonitoringToggle}
              togglingId={togglingId}
            />
          )}
        </CardContent>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <span>
            Showing <span className="tabular-nums">{filtered.length}</span> of{" "}
            <span className="tabular-nums">{companies.length}</span> companies
          </span>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link href="/dream-companies/new">
              <Plus className="h-3.5 w-3.5" />
              Add another
            </Link>
          </Button>
        </div>
      </Card>
        </>
      )}
    </>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-sm transition-colors",
        active
          ? "bg-primary-100 text-primary-700"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: DreamCompanyStatus }) {
  const style = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        style.bg,
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", style.dot)}
        aria-hidden
      />
      {status}
    </span>
  );
}

function CompanyCard({
  company: c,
  onMonitoringChange,
  toggling,
}: {
  company: DreamCompany;
  onMonitoringChange: (companyId: string, enabled: boolean) => void;
  toggling: boolean;
}) {
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/intelligence/${c.id}`} className="flex min-w-0 flex-1 items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {getInitials(c.name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground group-hover:text-primary">
              {c.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {c.industry}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <ScoreBadge score={c.opportunity_score} />
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Monitor
            </span>
            <Switch
              checked={Boolean(c.monitoring_enabled)}
              disabled={toggling}
              onCheckedChange={(checked) => onMonitoringChange(c.id, checked)}
              aria-label={`Monitor ${c.name}`}
            />
          </div>
        </div>
      </div>

      <Link href={`/intelligence/${c.id}`} className="flex flex-1 flex-col">

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {c.country}
        </span>
        <span className="inline-flex items-center gap-1">
          <Globe className="h-3 w-3" />
          {c.website.replace(/^https?:\/\//, "")}
        </span>
      </div>

      {c.last_signal ? (
        <p className="mt-3 rounded-lg bg-muted/50 p-2.5 text-xs leading-snug text-foreground">
          <span className="font-medium text-primary-700">Latest signal · </span>
          {c.last_signal}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
        <Stat label="Stakeholders" value={c.stakeholders_count} icon={Users} />
        <Stat label="Campaigns" value={c.campaigns_count} icon={Activity} />
        <Stat label="Emails" value={c.emails_count} icon={Mail} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StatusPill status={c.status} />
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          Updated {formatRelativeTime(c.updated_at)}
          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
        </span>
      </div>
      </Link>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-foreground">
        <Icon className="h-3 w-3 text-muted-foreground" />
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function CompanyTable({
  rows,
  onMonitoringChange,
  togglingId,
}: {
  rows: DreamCompany[];
  onMonitoringChange: (companyId: string, enabled: boolean) => void;
  togglingId: string | null;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-6">Company</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Country</TableHead>
          <TableHead>Monitor</TableHead>
          <TableHead>Opportunity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Stakeholders</TableHead>
          <TableHead className="text-right">Campaigns</TableHead>
          <TableHead className="pr-6 text-right">Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((c) => (
          <TableRow key={c.id} className="cursor-pointer">
            <TableCell className="pl-6">
              <Link
                href={`/intelligence/${c.id}`}
                className="flex items-center gap-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(c.name)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.website.replace(/^https?:\/\//, "")}
                  </p>
                </div>
              </Link>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {c.industry}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {c.country}
            </TableCell>
            <TableCell>
              <Switch
                checked={Boolean(c.monitoring_enabled)}
                disabled={togglingId === c.id}
                onCheckedChange={(checked) => onMonitoringChange(c.id, checked)}
                aria-label={`Monitor ${c.name}`}
              />
            </TableCell>
            <TableCell>
              <ScoreBadge score={c.opportunity_score} />
            </TableCell>
            <TableCell>
              <StatusPill status={c.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {c.stakeholders_count}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {c.campaigns_count}
            </TableCell>
            <TableCell className="pr-6 text-right text-xs text-muted-foreground">
              {formatRelativeTime(c.updated_at)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
