"use client";

import Link from "next/link";
import {
  Activity as ActivityIcon,
  Calendar,
  Check,
  Edit3,
  Lightbulb,
  Mail,
  Send,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatRelativeTime } from "@/lib/utils";
import type {
  CampaignDetail,
  CampaignTimelineStep,
  EmailStatus,
  TimelineStepStatus,
} from "@/lib/types";

const EMAIL_STATUS_STYLE: Record<EmailStatus, string> = {
  Draft: "bg-status-grey-bg text-status-grey-fg",
  "In Review": "bg-status-yellow-bg text-status-yellow-fg",
  Approved: "bg-status-green-bg text-status-green-fg",
  Sent: "bg-status-blue-bg text-status-blue-fg",
};

const TIMELINE_STATUS_STYLE: Record<
  TimelineStepStatus,
  { ring: string; bg: string }
> = {
  completed: {
    ring: "ring-status-green-fg/30",
    bg: "bg-status-green-bg text-status-green-fg",
  },
  in_progress: {
    ring: "ring-status-yellow-fg/30",
    bg: "bg-status-yellow-bg text-status-yellow-fg",
  },
  pending: {
    ring: "ring-border",
    bg: "bg-muted text-muted-foreground",
  },
};

/**
 * Reusable content for a single campaign. Used both by the standalone
 * /campaigns/[campaignId] route and the expanded accordion row on /campaigns.
 */
export function CampaignDetailView({ campaign }: { campaign: CampaignDetail }) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="ai">AI Intelligence</TabsTrigger>
        <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        <TabsTrigger value="emails">Emails</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ActivityIcon className="h-4 w-4 text-primary" />
                Campaign Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline steps={campaign.timeline} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Campaign Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground">
                {campaign.summary.key_signal}
              </p>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <SummaryRow label="Industry" value={campaign.summary.industry} />
                <SummaryRow label="Country" value={campaign.summary.country} />
                <SummaryRow
                  label="Added on"
                  value={formatRelativeTime(campaign.summary.added_on)}
                />
                <SummaryRow
                  label="Stakeholders"
                  value={`${campaign.stakeholders_count}`}
                />
              </dl>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Matched Services
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {campaign.summary.matched_services.map((s) => (
                    <li
                      key={s}
                      className="inline-flex items-center gap-1.5 rounded-full bg-status-green-bg px-2.5 py-1 text-xs font-medium text-status-green-fg"
                    >
                      <Wrench className="h-3 w-3" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-border bg-status-yellow-bg/30 p-3">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-foreground">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-yellow-fg" />
                  <span>
                    <span className="font-medium">
                      Why this is a high-value opportunity:
                    </span>{" "}
                    {campaign.summary.why_high_value}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  Email Sequence Status
                </CardTitle>
                <Link
                  href={`/email-workspace/${campaign.id}`}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all emails
                </Link>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {campaign.email_sequence.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-xs font-semibold text-primary-700">
                      {e.step}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {e.type}
                      </p>
                      <p className="truncate text-sm font-medium text-foreground">
                        {e.subject}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        EMAIL_STATUS_STYLE[e.status],
                      )}
                    >
                      {e.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Next Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link href={`/email-workspace/${campaign.id}`}>
                    <Edit3 className="h-4 w-4" />
                    Edit Emails
                  </Link>
                </Button>
                <Button className="justify-start">
                  <Send className="h-4 w-4" />
                  Send / Simulate Send
                </Button>
                <p className="px-1 text-xs text-muted-foreground">
                  Emails will simulate-send. Configure a provider in Settings to
                  enable live sending.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="ai">
        <Card>
          <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
            Open the company&apos;s{" "}
            <Link
              href={`/intelligence/${campaign.company.id}`}
              className="font-medium text-primary hover:underline"
            >
              AI Intelligence page
            </Link>{" "}
            for the full risk / services / stakeholder breakdown.
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stakeholders">
        <Card>
          <CardContent className="px-6 py-10 text-center text-sm text-muted-foreground">
            <Users className="mx-auto mb-2 h-5 w-5 text-status-purple-fg" />
            Stakeholder management is coming soon — for now, the recommended
            roles are listed on the Intelligence page.
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="emails">
        <Card>
          <CardContent className="space-y-2.5 p-5">
            {campaign.email_sequence.map((e) => (
              <Link
                key={e.id}
                href={`/email-workspace/${campaign.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-sm font-semibold text-primary-700">
                  {e.step}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {e.type}
                  </p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {e.subject}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    EMAIL_STATUS_STYLE[e.status],
                  )}
                >
                  {e.status}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {campaign.activity.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-status-green-bg text-status-green-fg">
                  <ActivityIcon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatRelativeTime(a.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function Timeline({ steps }: { steps: CampaignTimelineStep[] }) {
  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-dashed border-border pl-5">
      {steps.map((step) => {
        const style = TIMELINE_STATUS_STYLE[step.status];
        return (
          <li key={step.id} className="relative">
            <span
              className={cn(
                "absolute -left-[29px] flex h-5 w-5 items-center justify-center rounded-full ring-4",
                style.bg,
                style.ring,
              )}
              aria-hidden
            >
              {step.status === "completed" ? (
                <Check className="h-3 w-3" />
              ) : step.status === "in_progress" ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-status-yellow-fg" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
              )}
            </span>
            <p className="text-sm font-medium text-foreground">{step.label}</p>
            {step.caption ? (
              <p className="text-xs text-muted-foreground">{step.caption}</p>
            ) : null}
            {step.timestamp ? (
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatRelativeTime(step.timestamp)}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
