"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  Filter,
  Mail,
  MailPlus,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMockContacts } from "@/lib/mock-contacts";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import type { Contact, ContactStatus, Seniority } from "@/lib/types";

const STATUS_STYLE: Record<ContactStatus, { bg: string; dot: string }> = {
  "Not Contacted": {
    bg: "bg-status-grey-bg text-status-grey-fg",
    dot: "bg-status-grey-fg",
  },
  Queued: {
    bg: "bg-status-yellow-bg text-status-yellow-fg",
    dot: "bg-status-yellow-fg",
  },
  Contacted: {
    bg: "bg-status-blue-bg text-status-blue-fg",
    dot: "bg-status-blue-fg",
  },
  Replied: {
    bg: "bg-status-green-bg text-status-green-fg",
    dot: "bg-status-green-fg",
  },
  Bounced: {
    bg: "bg-status-red-bg text-status-red-fg",
    dot: "bg-status-red-fg",
  },
  Unsubscribed: {
    bg: "bg-status-purple-bg text-status-purple-fg",
    dot: "bg-status-purple-fg",
  },
};

const SENIORITY_STYLE: Record<Seniority, string> = {
  "C-Level": "bg-status-purple-bg text-status-purple-fg",
  VP: "bg-status-blue-bg text-status-blue-fg",
  Director: "bg-status-green-bg text-status-green-fg",
  Manager: "bg-status-yellow-bg text-status-yellow-fg",
  IC: "bg-status-grey-bg text-status-grey-fg",
};

const STATUS_FILTERS: (ContactStatus | "All")[] = [
  "All",
  "Not Contacted",
  "Queued",
  "Contacted",
  "Replied",
  "Bounced",
];

export default function ContactsPage() {
  const all = useMemo(() => getMockContacts(), []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContactStatus | "All">(
    "All",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((c) => {
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${c.first_name} ${c.last_name} ${c.title} ${c.company_name} ${c.email} ${c.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [all, query, statusFilter]);

  const kpis = useMemo(() => {
    const total = all.length;
    const engaged = all.filter((c) =>
      ["Contacted", "Replied"].includes(c.status),
    ).length;
    const replied = all.filter((c) => c.status === "Replied").length;
    const week = 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = all.filter(
      (c) => Date.now() - new Date(c.added_at).getTime() < week,
    ).length;
    return { total, engaged, replied, newThisWeek };
  }, [all]);

  const allSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));

  function toggleAll() {
    if (allSelected) {
      const next = new Set(selectedIds);
      filtered.forEach((c) => next.delete(c.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filtered.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  return (
    <>
      <PageHeader
        title="Contacts"
        subtitle="Stakeholders surfaced across your dream companies."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button>
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Contacts"
          value={kpis.total}
          icon={Users}
          tone="green"
          caption="Across all companies"
        />
        <KpiCard
          label="Engaged"
          value={kpis.engaged}
          icon={Mail}
          tone="blue"
          caption="Contacted or Replied"
        />
        <KpiCard
          label="Replied"
          value={kpis.replied}
          icon={MessageSquare}
          tone="purple"
          caption="Live conversations"
        />
        <KpiCard
          label="New This Week"
          value={kpis.newThisWeek}
          icon={CheckCircle2}
          tone="yellow"
          caption="Added in last 7 days"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">All Contacts</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, title, company…"
                className="h-9 w-[260px] rounded-md pl-9"
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
          </div>
        </CardHeader>

        {selectedIds.size > 0 ? (
          <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-50 px-6 py-2.5">
            <p className="text-sm text-primary-700">
              <span className="font-semibold tabular-nums">
                {selectedIds.size}
              </span>{" "}
              selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
              <Button size="sm">
                <MailPlus className="h-4 w-4" />
                Add to campaign
              </Button>
            </div>
          </div>
        ) : null}

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 pl-6">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
                    aria-label="Select all contacts on this page"
                  />
                </TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Seniority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No contacts match your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((c) => (
                  <ContactRow
                    key={c.id}
                    contact={c}
                    selected={selectedIds.has(c.id)}
                    onToggle={() => toggleOne(c.id)}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
          <span>
            Showing <span className="tabular-nums">{filtered.length}</span> of{" "}
            <span className="tabular-nums">{all.length}</span> contacts
          </span>
          <Button variant="ghost" size="sm" className="text-xs">
            <Plus className="h-3.5 w-3.5" />
            Load more
          </Button>
        </div>
      </Card>
    </>
  );
}

function ContactRow({
  contact: c,
  selected,
  onToggle,
}: {
  contact: Contact;
  selected: boolean;
  onToggle: () => void;
}) {
  const status = STATUS_STYLE[c.status];
  return (
    <TableRow className={cn(selected && "bg-primary-50/60")}>
      <TableCell className="pl-6">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="h-4 w-4 cursor-pointer rounded border-border accent-primary"
          aria-label={`Select ${c.first_name} ${c.last_name}`}
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-purple-bg text-xs font-semibold uppercase text-status-purple-fg">
            {getInitials(`${c.first_name} ${c.last_name}`)}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-foreground">
              {c.first_name} {c.last_name}
            </p>
            <p className="truncate text-xs text-muted-foreground">{c.title}</p>
            <a
              href={`mailto:${c.email}`}
              className="truncate text-xs text-primary hover:underline"
            >
              {c.email}
            </a>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Link
          href={`/intelligence/${c.company_id}`}
          className="group flex items-center gap-2.5"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-[11px] font-semibold uppercase text-primary">
            {getInitials(c.company_name)}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-medium text-foreground group-hover:text-primary">
              {c.company_name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {c.industry}
            </span>
          </span>
        </Link>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            SENIORITY_STYLE[c.seniority],
          )}
        >
          {c.seniority}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            status.bg,
          )}
        >
          <span
            className={cn("h-1.5 w-1.5 rounded-full", status.dot)}
            aria-hidden
          />
          {c.status}
        </span>
      </TableCell>
      <TableCell>
        {c.last_activity ? (
          <div className="leading-tight">
            <p className="text-sm text-foreground">{c.last_activity}</p>
            <p className="text-xs text-muted-foreground">
              {c.last_activity_at
                ? formatRelativeTime(c.last_activity_at)
                : "—"}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">No activity yet</span>
        )}
      </TableCell>
      <TableCell className="pr-6 text-right">
        <div className="inline-flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="Send email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
