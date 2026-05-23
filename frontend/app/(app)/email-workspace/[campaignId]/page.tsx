"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bold,
  Check,
  CheckCircle2,
  CircleHelp,
  Italic,
  Link as LinkIcon,
  List,
  Mail,
  RefreshCw,
  Save,
  Sparkles,
  Target,
  Tags,
  Wand2,
  Wrench,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getMockEmailWorkspace } from "@/lib/mock-emails";
import { cn } from "@/lib/utils";
import type { EmailDraft, EmailWorkspaceData } from "@/lib/types";

interface PageProps {
  params: { campaignId: string };
}

export default function EmailWorkspacePage({ params }: PageProps) {
  const { campaignId } = params;
  const initial = useMemo(
    () => getMockEmailWorkspace(campaignId),
    [campaignId],
  );

  const [data, setData] = useState<EmailWorkspaceData>(initial);
  const [activeId, setActiveId] = useState(initial.emails[0].id);

  // Re-sync when the route changes
  useEffect(() => {
    setData(initial);
    setActiveId(initial.emails[0].id);
  }, [initial]);

  const active = data.emails.find((e) => e.id === activeId) ?? data.emails[0];

  function updateActive(patch: Partial<EmailDraft>) {
    setData((d) => ({
      ...d,
      emails: d.emails.map((e) =>
        e.id === active.id ? { ...e, ...patch, updated: new Date().toISOString() } : e,
      ),
    }));
  }

  return (
    <>
      <PageHeader
        title={`Email Workspace — ${data.campaign_name}`}
        subtitle="Review and personalize your AI-generated emails before sending."
        action={
          <Button variant="outline">
            <Mail className="h-4 w-4" />
            Preview Email
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {data.emails.map((e) => {
          const isActive = e.id === active.id;
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => setActiveId(e.id)}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary-100/60 text-primary-700 shadow-sm"
                  : "border-border bg-card text-foreground hover:bg-muted",
              )}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {e.step}
              </span>
              <span className="leading-tight">
                <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                  Email {e.step}
                </span>
                <span className="block font-medium">{e.type}</span>
              </span>
              <StatusBadge status={e.status} className="ml-2" />
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
        <PersonalizationPanel data={data} />
        <EditorPanel active={active} onChange={updateActive} />
        <ScoresPanel
          active={active}
          onApprove={() => {
            updateActive({ status: "Approved" });
            toast.success(`Email ${active.step} approved.`);
          }}
          onRegenerate={() => toast("Regenerating email…")}
          onSaveDraft={() => toast.success("Draft saved.")}
        />
      </div>
    </>
  );
}

function PersonalizationPanel({ data }: { data: EmailWorkspaceData }) {
  const { personalization: p } = data;
  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          Personalization Reasons
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section
          icon={<Sparkles className="h-3.5 w-3.5 text-status-blue-fg" />}
          title="Recent AI Initiative"
          tone="bg-status-blue-bg"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {p.recent_ai_initiative}
          </p>
        </Section>

        <Section
          icon={<ShieldAlert className="h-3.5 w-3.5 text-status-red-fg" />}
          title="Detected Risks"
          tone="bg-status-red-bg"
        >
          <ul className="space-y-1">
            {p.detected_risks.map((r) => (
              <li
                key={r}
                className="rounded-md bg-status-red-bg/40 px-2.5 py-1.5 text-xs text-foreground"
              >
                {r}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={<Wrench className="h-3.5 w-3.5 text-status-green-fg" />}
          title="Matched Services"
          tone="bg-status-green-bg"
        >
          <ul className="space-y-1">
            {p.matched_services.map((s) => (
              <li
                key={s}
                className="rounded-md bg-status-green-bg/40 px-2.5 py-1.5 text-xs text-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
        </Section>

        <Section
          icon={<Target className="h-3.5 w-3.5 text-status-purple-fg" />}
          title="Targeting"
          tone="bg-status-purple-bg"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {p.targeting}
          </p>
        </Section>

        <Section
          icon={<Tags className="h-3.5 w-3.5 text-status-yellow-fg" />}
          title="Context Summary"
          tone="bg-status-yellow-bg"
        >
          <p className="text-xs leading-relaxed text-muted-foreground">
            {p.context_summary}
          </p>
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({
  icon,
  title,
  tone,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-md",
            tone,
          )}
        >
          {icon}
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function EditorPanel({
  active,
  onChange,
}: {
  active: EmailDraft;
  onChange: (patch: Partial<EmailDraft>) => void;
}) {
  const charCount = active.body.length;
  const wordCount = active.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Card className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Email {active.step} · {active.type}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs text-status-green-fg">
          <CheckCircle2 className="h-3.5 w-3.5" />
          All changes saved
        </span>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-1.5">
          <label
            htmlFor="subject"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Subject
          </label>
          <Input
            id="subject"
            value={active.subject}
            onChange={(e) => onChange({ subject: e.target.value })}
            className="text-base font-medium"
          />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
            <ToolbarButton label="Bold">
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Italic">
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Bulleted list">
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton label="Insert link">
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
            <Separator orientation="vertical" className="mx-1 h-5" />
            <ToolbarButton label="Insert variable">
              <Tags className="h-4 w-4" />
            </ToolbarButton>
            <div className="ml-auto flex items-center gap-1.5 pr-1 text-xs text-muted-foreground">
              <CircleHelp className="h-3.5 w-3.5" />
              Markdown supported
            </div>
          </div>
          <Textarea
            value={active.body}
            onChange={(e) => onChange({ body: e.target.value })}
            rows={16}
            className="resize-none rounded-none border-0 px-4 py-3 font-mono text-sm leading-relaxed focus-visible:ring-0"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Characters: <span className="tabular-nums">{charCount}</span> · Words:{" "}
            <span className="tabular-nums">{wordCount}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-status-green-fg" />
            All changes saved
          </span>
        </div>
      </div>
    </Card>
  );
}

function ToolbarButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

function ScoresPanel({
  active,
  onApprove,
  onRegenerate,
  onSaveDraft,
}: {
  active: EmailDraft;
  onApprove: () => void;
  onRegenerate: () => void;
  onSaveDraft: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">AI Scores</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <ScoreDial
            label="Personalization Score"
            value={active.personalization_score}
          />
          <ScoreDial
            label="Relevance Score"
            value={active.relevance_score}
            tone="blue"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {active.ai_suggestions.map((s, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-2.5"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                {i + 1}
              </span>
              <p className="text-xs leading-relaxed text-foreground">{s}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            type="button"
          >
            <Wand2 className="h-4 w-4" />
            Edit with AI
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onRegenerate}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate Email
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={onSaveDraft}
            type="button"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button className="w-full justify-start" onClick={onApprove} type="button">
            <Check className="h-4 w-4" />
            Approve Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScoreDial({
  label,
  value,
  tone = "green",
}: {
  label: string;
  value: number;
  tone?: "green" | "blue";
}) {
  const stroke = tone === "blue" ? "hsl(var(--status-blue-fg))" : "hsl(var(--primary))";
  const trackBg = tone === "blue" ? "hsl(var(--status-blue-bg))" : "hsl(var(--primary-100))";
  const r = 30;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/40 p-3 text-center">
      <div className="relative h-20 w-20">
        <svg
          viewBox="0 0 80 80"
          className="-rotate-90"
          aria-label={`${label} ${value}%`}
        >
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={trackBg}
            strokeWidth="8"
          />
          <circle
            cx="40"
            cy="40"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold tabular-nums text-foreground">
          {value}
        </span>
      </div>
      <p className="text-xs leading-tight text-muted-foreground">{label}</p>
    </div>
  );
}
