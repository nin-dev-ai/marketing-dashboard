"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Download,
  ExternalLink,
  Globe,
  Lightbulb,
  Mail,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { ScoreBadge } from "@/components/shared/score-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMockIntelligence } from "@/lib/mock-intelligence";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { Risk } from "@/lib/types";

interface PageProps {
  params: { companyId: string };
}

const SEVERITY_STYLE: Record<Risk["severity"], string> = {
  Low: "bg-status-blue-bg text-status-blue-fg",
  Medium: "bg-status-yellow-bg text-status-yellow-fg",
  High: "bg-status-red-bg text-status-red-fg",
  Critical: "bg-status-red-bg text-status-red-fg",
};

export default function IntelligencePage({ params }: PageProps) {
  const { companyId } = params;
  const router = useRouter();
  const intel = useMemo(() => getMockIntelligence(companyId), [companyId]);
  const [activeTab, setActiveTab] = useState("ai");

  const { company } = intel;

  return (
    <>
      <div className="mb-4">
        <Link
          href="/dream-companies"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dream Companies
        </Link>
      </div>

      <Card className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
              {getInitials(company.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {company.name}
                </h1>
                {company.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {company.industry}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {company.country}
                </span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-foreground"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.website.replace(/^https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                Opportunity Score
              </span>
              <ScoreBadge
                score={intel.opportunity_score}
                className="mt-1 px-3 py-1 text-base"
              />
            </div>
            <div className="hidden h-10 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Download Report
              </Button>
              <Button>
                <RefreshCw className="h-4 w-4" />
                Regenerate Intelligence
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="ai">AI Intelligence</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="services">Matched Services</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Latest AI Signal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <p className="text-sm font-semibold leading-snug text-foreground">
                  {intel.latest_signal.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {intel.latest_signal.source} ·{" "}
                  {formatRelativeTime(intel.latest_signal.published_at)}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {intel.latest_signal.summary}
                </p>
                {intel.latest_signal.url ? (
                  <a
                    href={intel.latest_signal.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    Read source
                    <ExternalLink className="h-3 w-3" />
                  </a>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-primary" />
                  AI Initiative Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {intel.initiative_summary}
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  Why This Company?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {intel.why_this_company}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldAlert className="h-4 w-4 text-status-red-fg" />
                  Potential AI / Cyber Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {intel.risks.slice(0, 4).map((risk) => (
                  <div
                    key={risk.id}
                    className="rounded-lg border border-border bg-muted/30 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {risk.title}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          SEVERITY_STYLE[risk.severity],
                        )}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {risk.description}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveTab("risks")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all risks
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Wrench className="h-4 w-4 text-status-green-fg" />
                  Matched Cybersecurity Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {intel.matched_services.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border border-border bg-status-green-bg/30 p-3"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {s.name}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {s.rationale}
                    </p>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveTab("services")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all services
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-status-purple-fg" />
                  Recommended Stakeholders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {intel.stakeholders.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 rounded-lg border border-border bg-status-purple-bg/30 p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-purple-bg text-xs font-semibold uppercase text-status-purple-fg">
                      {getInitials(p.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {p.reason}
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setActiveTab("stakeholders")}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  View all stakeholders
                </button>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="flex flex-col gap-4 bg-gradient-to-r from-primary-50 to-card p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Key Takeaway
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    {intel.key_takeaway}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="outline">
                  <Bookmark className="h-4 w-4" />
                  Save Campaign
                </Button>
                <Button
                  onClick={() => router.push(`/email-workspace/${companyId}`)}
                >
                  <Mail className="h-4 w-4" />
                  Generate Emails
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card>
            <CardContent className="space-y-3 p-5">
              {intel.risks.map((risk) => (
                <div
                  key={risk.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {risk.title}
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
                        SEVERITY_STYLE[risk.severity],
                      )}
                    >
                      {risk.severity}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {risk.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardContent className="space-y-3 p-5">
              {intel.matched_services.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border border-border bg-status-green-bg/20 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {s.name}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {s.rationale}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders">
          <Card>
            <CardContent className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
              {intel.stakeholders.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-purple-bg text-sm font-semibold uppercase text-status-purple-fg">
                    {getInitials(p.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                    {p.team ? (
                      <p className="text-xs text-muted-foreground">
                        Team: {p.team}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {p.reason}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {intel.sources.map((src) => (
                <a
                  key={src.id}
                  href={src.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {src.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {src.publisher} · {formatRelativeTime(src.date)}
                    </p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex items-center justify-end gap-2 md:hidden">
        <Button variant="outline">
          <Send className="h-4 w-4" />
          Save Campaign
        </Button>
        <Button onClick={() => router.push(`/email-workspace/${companyId}`)}>
          <Mail className="h-4 w-4" />
          Generate Emails
        </Button>
      </div>
    </>
  );
}
