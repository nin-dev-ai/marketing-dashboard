"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowLeft,
  Building2,
  Edit3,
  ExternalLink,
  Globe,
  MapPin,
} from "lucide-react";

import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";
import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getMockCampaign } from "@/lib/mock-campaign";
import { cn, getInitials } from "@/lib/utils";

interface PageProps {
  params: { campaignId: string };
}

export default function CampaignDetailPage({ params }: PageProps) {
  const { campaignId } = params;
  const campaign = useMemo(() => getMockCampaign(campaignId), [campaignId]);
  const { company } = campaign;

  return (
    <>
      <div className="mb-4">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
              {getInitials(company.name)}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {campaign.name}
                </h1>
                <span className="inline-flex items-center rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700">
                  {company.name}
                </span>
                {company.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-status-blue-bg px-2.5 py-0.5 text-xs font-medium text-status-blue-fg"
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

          <div className="flex flex-wrap items-center gap-3 lg:gap-5">
            <KpiStat label="Opportunity Score" tone="green">
              <ScoreBadge
                score={campaign.opportunity_score}
                className="px-2.5 py-1 text-base"
              />
            </KpiStat>
            <Separator orientation="vertical" className="hidden h-10 lg:block" />
            <KpiStat label="Emails" tone="purple">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {campaign.emails_count}
              </span>
            </KpiStat>
            <Separator orientation="vertical" className="hidden h-10 lg:block" />
            <KpiStat label="Stakeholders" tone="blue">
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {campaign.stakeholders_count}
              </span>
            </KpiStat>
            <Separator orientation="vertical" className="hidden h-10 lg:block" />
            <KpiStat label="Status" tone="yellow">
              <StatusBadge status={campaign.status} />
            </KpiStat>
            <Button variant="outline" className="ml-2">
              <Edit3 className="h-4 w-4" />
              Edit Campaign
            </Button>
          </div>
        </div>
      </Card>

      <CampaignDetailView campaign={campaign} />
    </>
  );
}

function KpiStat({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "green" | "yellow" | "blue" | "purple";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "text-xs font-medium uppercase tracking-wide",
          tone === "green" && "text-status-green-fg",
          tone === "yellow" && "text-status-yellow-fg",
          tone === "blue" && "text-status-blue-fg",
          tone === "purple" && "text-status-purple-fg",
        )}
      >
        {label}
      </span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}
