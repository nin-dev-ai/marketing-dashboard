"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  CalendarDays,
  Clock,
  Newspaper,
  Save,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getJobStatus,
  getMatchSummaries,
  getMatchTable,
  runDailyJob,
  runWeeklyJob,
  updateJobSettings,
  type JobSettingsPatch,
} from "@/lib/api";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { JobSettings, JobStatus, MatchSummaryRow, MatchTableRow } from "@/lib/types";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function JobsPage() {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [settings, setSettings] = useState<JobSettings | null>(null);
  const [dailyMatches, setDailyMatches] = useState<MatchTableRow[]>([]);
  const [weeklySummaries, setWeeklySummaries] = useState<MatchSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState<"daily" | "weekly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [jobStatus, matches, summaries] = await Promise.all([
        getJobStatus(signal),
        getMatchTable({ limit: 20 }, signal),
        getMatchSummaries({ limit: 20 }, signal),
      ]);
      if (signal?.aborted) return;
      setStatus(jobStatus);
      setSettings(jobStatus.settings);
      setDailyMatches(matches);
      setWeeklySummaries(summaries);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : "Could not load job settings");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  function patchSettings(patch: JobSettingsPatch) {
    if (!settings) return;
    setSettings({ ...settings, ...patch });
  }

  async function handleRun(job: "daily" | "weekly") {
    setRunning(job);
    try {
      const result =
        job === "daily" ? await runDailyJob() : await runWeeklyJob();
      toast.success(
        `${job === "daily" ? "Daily" : "Weekly"} job finished — ${result.succeeded}/${result.companies_processed} succeeded`,
      );
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Job run failed");
    } finally {
      setRunning(null);
    }
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      const saved = await updateJobSettings({
        daily_scan_enabled: settings.daily_scan_enabled,
        daily_scan_time: settings.daily_scan_time.slice(0, 5),
        timezone: settings.timezone,
        weekly_summary_enabled: settings.weekly_summary_enabled,
        weekly_interval_days: settings.weekly_interval_days,
        weekly_run_day: settings.weekly_run_day,
        campaign_mode: settings.campaign_mode,
        min_opportunity_score: settings.min_opportunity_score,
      });
      setSettings(saved);
      toast.success("Job settings saved");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <PageHeader
          title="Jobs"
          subtitle="Configure daily news scanning and weekly campaign review."
        />
        <p className="py-16 text-center text-sm text-muted-foreground">
          Loading job configuration…
        </p>
      </>
    );
  }

  if (error || !settings || !status) {
    return (
      <>
        <PageHeader title="Jobs" subtitle="Configure automated monitoring jobs." />
        <p className="rounded-xl border border-status-red-fg/20 bg-status-red-bg/40 px-4 py-3 text-sm text-status-red-fg">
          {error ?? "Job settings unavailable"}. Ensure Postgres is running.
        </p>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle="Turn on companies in Dream Companies, then schedule daily news scans and weekly campaign reviews."
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void handleRun("daily")}
              disabled={running !== null}
            >
              {running === "daily" ? "Running daily…" : "Run daily now"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void handleRun("weekly")}
              disabled={running !== null}
            >
              {running === "weekly" ? "Running weekly…" : "Run weekly now"}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "Saving…" : "Save settings"}
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Monitoring On"
          value={status.monitoring_enabled_count}
          icon={Zap}
          tone="green"
          caption={`of ${status.total_companies} dream companies`}
        />
        <KpiCard
          label="Pending Reviews"
          value={status.pending_decisions}
          icon={BellRing}
          tone="yellow"
          caption="Weekly campaign decisions"
        />
        <KpiCard
          label="Daily Matches (7d)"
          value={status.daily_matches_7d}
          icon={Newspaper}
          tone="blue"
          caption="Rows in match_table"
        />
        <KpiCard
          label="Weekly Summaries (30d)"
          value={status.weekly_summaries_30d}
          icon={Sparkles}
          tone="purple"
          caption="Rows in match_summary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-primary" />
              Daily news scan
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              For every company with monitoring turned on, search website and
              LinkedIn and append results to{" "}
              <code className="text-xs">match_table</code>. Agent wiring comes
              next.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="daily-enabled">Enable daily scan</Label>
                <p className="text-xs text-muted-foreground">
                  Runs once per day at the configured time
                </p>
              </div>
              <Switch
                id="daily-enabled"
                checked={settings.daily_scan_enabled}
                onCheckedChange={(checked) =>
                  patchSettings({ daily_scan_enabled: checked })
                }
                aria-label="Enable daily scan"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="daily-time">Run time</Label>
                <Input
                  id="daily-time"
                  type="time"
                  value={settings.daily_scan_time.slice(0, 5)}
                  onChange={(e) =>
                    patchSettings({ daily_scan_time: `${e.target.value}:00` })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  value={settings.timezone}
                  onChange={(e) => patchSettings({ timezone: e.target.value })}
                  placeholder="Asia/Dubai"
                />
              </div>
            </div>
            {settings.last_daily_run_at ? (
              <p className="text-xs text-muted-foreground">
                Last run: {formatRelativeTime(settings.last_daily_run_at)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No daily runs yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" />
              Weekly summary &amp; campaign
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              After collecting daily matches, summarize the week into{" "}
              <code className="text-xs">match_summary</code> and surface top
              service opportunities.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="weekly-enabled">Enable weekly summary</Label>
                <p className="text-xs text-muted-foreground">
                  Rolls up daily matches on a fixed interval
                </p>
              </div>
              <Switch
                id="weekly-enabled"
                checked={settings.weekly_summary_enabled}
                onCheckedChange={(checked) =>
                  patchSettings({ weekly_summary_enabled: checked })
                }
                aria-label="Enable weekly summary"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interval">Interval (days)</Label>
                <Input
                  id="interval"
                  type="number"
                  min={1}
                  max={30}
                  value={settings.weekly_interval_days}
                  onChange={(e) =>
                    patchSettings({
                      weekly_interval_days: Number(e.target.value) || 7,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="run-day">Run day</Label>
                <select
                  id="run-day"
                  value={settings.weekly_run_day}
                  onChange={(e) =>
                    patchSettings({ weekly_run_day: Number(e.target.value) })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {WEEKDAYS.map((day, idx) => (
                    <option key={day} value={idx}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {settings.last_weekly_run_at ? (
              <p className="text-xs text-muted-foreground">
                Last run: {formatRelativeTime(settings.last_weekly_run_at)}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No weekly runs yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Campaign behavior</CardTitle>
          <p className="text-sm text-muted-foreground">
            When a weekly summary completes, either notify you to decide or
            auto-start a campaign if the opportunity score clears your threshold.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => patchSettings({ campaign_mode: "notify" })}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                settings.campaign_mode === "notify"
                  ? "border-primary bg-primary-50"
                  : "border-border hover:border-primary-200",
              )}
            >
              <p className="text-sm font-semibold text-foreground">
                Notify me
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Bell notification when the 7-day window completes. You approve or
                dismiss before a campaign starts.
              </p>
            </button>
            <button
              type="button"
              onClick={() => patchSettings({ campaign_mode: "auto" })}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                settings.campaign_mode === "auto"
                  ? "border-primary bg-primary-50"
                  : "border-border hover:border-primary-200",
              )}
            >
              <p className="text-sm font-semibold text-foreground">
                Auto-start campaign
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Automatically queue outreach when opportunity score meets your
                minimum threshold.
              </p>
            </button>
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor="min-score">Minimum opportunity score</Label>
            <Input
              id="min-score"
              type="number"
              min={0}
              max={100}
              value={settings.min_opportunity_score}
              onChange={(e) =>
                patchSettings({
                  min_opportunity_score: Number(e.target.value) || 0,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Daily matches</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent rows from <code className="text-xs">match_table</code>
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {dailyMatches.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No daily matches yet. Enable companies and run the daily scan
                agent.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Company</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="pr-6 text-right">Condensed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyMatches.map((row) => (
                    <TableRow key={row.match_id}>
                      <TableCell className="pl-6 text-sm font-medium">
                        {row.company_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.match_date}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm">
                        {row.condensed ? "Yes" : "No"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Weekly summaries</CardTitle>
            <p className="text-sm text-muted-foreground">
              Recent rows from <code className="text-xs">match_summary</code>
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {weeklySummaries.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                No weekly summaries yet. They appear after the weekly rollup agent
                runs.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Company</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="pr-6 text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklySummaries.map((row) => (
                    <TableRow key={row.summary_id}>
                      <TableCell className="pl-6 text-sm font-medium">
                        {row.company_name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.summary_start_date} → {row.summary_end_date}
                      </TableCell>
                      <TableCell className="pr-6 text-right tabular-nums text-sm">
                        {row.opportunity_score}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
