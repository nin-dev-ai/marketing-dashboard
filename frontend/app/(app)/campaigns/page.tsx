"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Building2,
  ChevronDown,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  Search,
} from "lucide-react";

import { CampaignDetailView } from "@/components/campaigns/campaign-detail-view";
import { PageHeader } from "@/components/layout/page-header";
import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getMockCampaignsList } from "@/lib/mock-campaign";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { CampaignDetail, CampaignStatus } from "@/lib/types";

const STATUS_FILTERS: (CampaignStatus | "All")[] = [
  "All",
  "Draft",
  "In Progress",
  "Ready to Send",
  "Sent",
];

export default function CampaignsPage() {
  const campaigns = useMemo(() => getMockCampaignsList(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "All">(
    "All",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay =
        `${c.name} ${c.company.name} ${c.company.industry} ${c.company.country}`.toLowerCase();
      return hay.includes(q);
    });
  }, [campaigns, query, statusFilter]);

  function toggle(id: string) {
    setExpandedId((cur) => (cur === id ? null : id));
  }

  return (
    <>
      <PageHeader
        title="Campaigns"
        subtitle="All outreach campaigns. Click any company to expand the full plan."
        action={
          <Button asChild>
            <Link href="/dream-companies/new">
              <Plus className="h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campaigns, companies, industries…"
              className="h-9 w-full pl-9 lg:w-[320px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
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
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() =>
                setExpandedId(
                  expandedId
                    ? null
                    : (filtered[0]?.id ?? null),
                )
              }
            >
              {expandedId ? "Collapse all" : "Expand first"}
            </Button>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <div className="py-16 text-center text-sm text-muted-foreground">
            No campaigns match your filters.
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign) => (
            <CampaignAccordionItem
              key={campaign.id}
              campaign={campaign}
              expanded={expandedId === campaign.id}
              onToggle={() => toggle(campaign.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}

function CampaignAccordionItem({
  campaign,
  expanded,
  onToggle,
}: {
  campaign: CampaignDetail;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { company } = campaign;
  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        expanded && "shadow-card-hover ring-1 ring-primary-100",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`campaign-${campaign.id}-content`}
        className={cn(
          "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40",
          expanded && "bg-primary-50/40",
        )}
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
          {getInitials(company.name)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-foreground">
              {campaign.name}
            </p>
            <span className="inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700">
              {company.name}
            </span>
            {company.tags?.slice(0, 2).map((t) => (
              <span
                key={t}
                className="hidden items-center rounded-full bg-status-blue-bg px-2 py-0.5 text-[11px] font-medium text-status-blue-fg sm:inline-flex"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {company.industry}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {company.country}
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <Globe className="h-3 w-3" />
              {company.website.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-5 text-right md:flex">
          <Stat label="Score">
            <ScoreBadge score={campaign.opportunity_score} />
          </Stat>
          <Stat label="Emails">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {campaign.emails_count}
            </span>
          </Stat>
          <Stat label="Stakeholders">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {campaign.stakeholders_count}
            </span>
          </Stat>
          <Stat label="Status">
            <StatusBadge status={campaign.status} />
          </Stat>
        </div>

        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180 text-primary",
          )}
        />
      </button>

      {expanded ? (
        <div
          id={`campaign-${campaign.id}-content`}
          className="border-t border-border bg-muted/20 p-5"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Updated {formatRelativeTime(campaign.activity[0]?.timestamp ?? campaign.summary.added_on)}
              </span>
            </div>
            <Link
              href={`/campaigns/${campaign.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Open full page
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <CampaignDetailView campaign={campaign} />
        </div>
      ) : null}
    </Card>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </div>
  );
}
