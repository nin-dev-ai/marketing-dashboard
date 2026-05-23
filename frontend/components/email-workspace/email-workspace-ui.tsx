"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Inbox,
  Mail,
  MailOpen,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getMockContacts } from "@/lib/mock-contacts";
import { getMockEmailWorkspace } from "@/lib/mock-emails";
import { cn, getInitials } from "@/lib/utils";
import type { Contact, ContactStatus, EmailDraft } from "@/lib/types";

interface CompanyGroup {
  id: string;
  name: string;
  industry: string;
  contacts: Contact[];
}

const STATUS_DOT: Record<ContactStatus, string> = {
  "Not Contacted": "bg-status-grey-fg",
  Queued: "bg-status-yellow-fg",
  Contacted: "bg-status-blue-fg",
  Replied: "bg-status-green-fg",
  Bounced: "bg-status-red-fg",
  Unsubscribed: "bg-status-purple-fg",
};

const STATUS_PILL: Record<ContactStatus, string> = {
  "Not Contacted": "bg-status-grey-bg text-status-grey-fg",
  Queued: "bg-status-yellow-bg text-status-yellow-fg",
  Contacted: "bg-status-blue-bg text-status-blue-fg",
  Replied: "bg-status-green-bg text-status-green-fg",
  Bounced: "bg-status-red-bg text-status-red-fg",
  Unsubscribed: "bg-status-purple-bg text-status-purple-fg",
};

export function EmailWorkspaceUI({
  initialContactId,
}: {
  initialContactId?: string;
}) {
  const allContacts = useMemo(() => getMockContacts(), []);

  const groups = useMemo<CompanyGroup[]>(() => {
    const byCompany = new Map<string, CompanyGroup>();
    for (const c of allContacts) {
      if (!byCompany.has(c.company_id)) {
        byCompany.set(c.company_id, {
          id: c.company_id,
          name: c.company_name,
          industry: c.industry,
          contacts: [],
        });
      }
      byCompany.get(c.company_id)!.contacts.push(c);
    }
    return Array.from(byCompany.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [allContacts]);

  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    initialContactId ?? null,
  );
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // Pre-expand the company of the initial selection (if any)
    if (initialContactId) {
      const found = allContacts.find((c) => c.id === initialContactId);
      if (found) return new Set([found.company_id]);
    }
    return new Set(groups[0] ? [groups[0].id] : []);
  });

  const selectedContact = useMemo(
    () => allContacts.find((c) => c.id === selectedContactId) ?? null,
    [allContacts, selectedContactId],
  );

  function toggleGroup(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectContact(c: Contact) {
    setSelectedContactId(c.id);
    // ensure the company is expanded
    setExpanded((prev) => new Set(prev).add(c.company_id));
  }

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        contacts: g.contacts.filter((c) => {
          const hay =
            `${c.first_name} ${c.last_name} ${c.title} ${c.email} ${g.name} ${g.industry}`.toLowerCase();
          return hay.includes(q);
        }),
      }))
      .filter((g) => g.contacts.length > 0);
  }, [groups, query]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <Picker
        groups={filteredGroups}
        expanded={expanded}
        toggleGroup={toggleGroup}
        selectedContactId={selectedContactId}
        onSelect={selectContact}
        query={query}
        setQuery={setQuery}
      />

      {selectedContact ? (
        <ContactWorkspace
          key={selectedContact.id}
          contact={selectedContact}
        />
      ) : (
        <EmptyState
          recent={allContacts
            .filter((c) => c.status === "Contacted" || c.status === "Replied")
            .slice(0, 4)}
          onPick={selectContact}
        />
      )}
    </div>
  );
}

/* --- Picker ------------------------------------------------------------- */

function Picker({
  groups,
  expanded,
  toggleGroup,
  selectedContactId,
  onSelect,
  query,
  setQuery,
}: {
  groups: CompanyGroup[];
  expanded: Set<string>;
  toggleGroup: (id: string) => void;
  selectedContactId: string | null;
  onSelect: (c: Contact) => void;
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <Card className="h-fit overflow-hidden lg:sticky lg:top-20">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Companies &amp; contacts
        </p>
      </div>
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contacts…"
            className="h-9 rounded-md pl-9 text-sm"
          />
        </div>
      </div>

      <div className="max-h-[640px] overflow-y-auto p-2 scrollbar-thin">
        {groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted-foreground">
            No contacts match your search.
          </p>
        ) : (
          groups.map((g) => {
            const isOpen = expanded.has(g.id);
            return (
              <div key={g.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(g.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-muted"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary-100 text-[10px] font-semibold uppercase text-primary">
                    {getInitials(g.name)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {g.name}
                  </span>
                  <span className="rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                    {g.contacts.length}
                  </span>
                </button>

                {isOpen ? (
                  <ul className="ml-3 mt-0.5 space-y-0.5 border-l border-border pl-2">
                    {g.contacts.map((c) => {
                      const active = c.id === selectedContactId;
                      return (
                        <li key={c.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(c)}
                            className={cn(
                              "flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors",
                              active
                                ? "bg-primary-100 text-primary-700"
                                : "hover:bg-muted",
                            )}
                            aria-current={active ? "true" : undefined}
                          >
                            <span
                              className={cn(
                                "mt-0.5 inline-flex h-1.5 w-1.5 shrink-0 rounded-full",
                                STATUS_DOT[c.status],
                              )}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1 leading-tight">
                              <span
                                className={cn(
                                  "block truncate text-sm font-medium",
                                  active
                                    ? "text-primary-700"
                                    : "text-foreground",
                                )}
                              >
                                {c.first_name} {c.last_name}
                              </span>
                              <span className="block truncate text-[11px] text-muted-foreground">
                                {c.title}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

/* --- Empty state -------------------------------------------------------- */

function EmptyState({
  recent,
  onPick,
}: {
  recent: Contact[];
  onPick: (c: Contact) => void;
}) {
  return (
    <Card>
      <CardContent className="flex min-h-[440px] flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary">
          <Inbox className="h-7 w-7" />
        </span>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Pick a contact to start drafting
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Choose a company on the left, then select the person you want to
            reach. Emitly generates a 3-step sequence personalized to them.
          </p>
        </div>

        {recent.length > 0 ? (
          <div className="w-full max-w-xl">
            <p className="mb-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Recently engaged
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recent.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onPick(c)}
                  className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2.5 text-left transition-colors hover:border-primary-200 hover:bg-primary-50/40"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-purple-bg text-xs font-semibold uppercase text-status-purple-fg">
                    {getInitials(`${c.first_name} ${c.last_name}`)}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {c.first_name} {c.last_name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {c.title} · {c.company_name}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* --- Contact workspace -------------------------------------------------- */

function personalize(text: string, contact: Contact): string {
  return text
    .replace(/\{\{first_name\}\}/g, contact.first_name)
    .replace(/\{\{last_name\}\}/g, contact.last_name)
    .replace(/\{\{sender_name\}\}/g, "James");
}

function ContactWorkspace({ contact }: { contact: Contact }) {
  const initial = useMemo(
    () => getMockEmailWorkspace(contact.company_id),
    [contact.company_id],
  );

  const personalizedEmails = useMemo<EmailDraft[]>(
    () =>
      initial.emails.map((e) => ({
        ...e,
        subject: personalize(e.subject, contact),
        body: personalize(e.body, contact),
      })),
    [initial.emails, contact],
  );

  const [emails, setEmails] = useState<EmailDraft[]>(personalizedEmails);
  const [activeId, setActiveId] = useState<string>(personalizedEmails[0].id);

  useEffect(() => {
    setEmails(personalizedEmails);
    setActiveId(personalizedEmails[0].id);
  }, [personalizedEmails]);

  const active = emails.find((e) => e.id === activeId) ?? emails[0];

  function patchActive(patch: Partial<EmailDraft>) {
    setEmails((list) =>
      list.map((e) =>
        e.id === active.id
          ? { ...e, ...patch, updated: new Date().toISOString() }
          : e,
      ),
    );
  }

  return (
    <div className="space-y-4">
      <ContactHeader contact={contact} />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 p-2">
          {emails.map((e) => {
            const isActive = e.id === active.id;
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => setActiveId(e.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-pressed={isActive}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-semibold",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {e.step}
                </span>
                <span>{e.type}</span>
                {e.status === "Approved" ? (
                  <Check className="h-3 w-3 text-status-green-fg" />
                ) : null}
              </button>
            );
          })}
        </div>

        <EmailEditor email={active} onChange={patchActive} />
      </Card>

      <AIInsights email={active} />

      <ActionsBar
        active={active}
        onApprove={() => {
          patchActive({ status: "Approved" });
          toast.success(`Email ${active.step} approved for ${contact.first_name}.`);
        }}
        onRegenerate={() => toast(`Regenerating email ${active.step}…`)}
        onSaveDraft={() => toast.success("Draft saved.")}
        onEditAI={() => toast(`Opening AI editor…`)}
      />
    </div>
  );
}

function ContactHeader({ contact }: { contact: Contact }) {
  return (
    <Card>
      <div className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-status-purple-bg text-sm font-semibold uppercase text-status-purple-fg">
            {getInitials(`${contact.first_name} ${contact.last_name}`)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-foreground">
                {contact.first_name} {contact.last_name}
              </p>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium",
                  STATUS_PILL[contact.status],
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    STATUS_DOT[contact.status],
                  )}
                />
                {contact.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {contact.title} · {contact.company_name}
            </p>
            <a
              href={`mailto:${contact.email}`}
              className="text-xs text-primary hover:underline"
            >
              {contact.email}
            </a>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {contact.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-medium text-primary-700"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

function EmailEditor({
  email,
  onChange,
}: {
  email: EmailDraft;
  onChange: (patch: Partial<EmailDraft>) => void;
}) {
  const charCount = email.body.length;
  const wordCount = email.body.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-4 p-5">
      <div className="space-y-1.5">
        <label
          htmlFor="subject"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Subject
        </label>
        <Input
          id="subject"
          value={email.subject}
          onChange={(e) => onChange({ subject: e.target.value })}
          className="h-11 text-[15px] font-medium"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="body"
          className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
        >
          Message
        </label>
        <Textarea
          id="body"
          value={email.body}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={14}
          className="resize-y rounded-lg border-border bg-card text-sm leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          <span className="tabular-nums">{wordCount}</span> words ·{" "}
          <span className="tabular-nums">{charCount}</span> characters
        </span>
        <span className="inline-flex items-center gap-1.5 text-status-green-fg">
          <CheckCircle2 className="h-3.5 w-3.5" />
          All changes saved
        </span>
      </div>
    </div>
  );
}

function AIInsights({ email }: { email: EmailDraft }) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            AI Insights
          </span>
        </span>
        <span className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>
            Personalization{" "}
            <span className="tabular-nums text-foreground">
              {email.personalization_score}
            </span>
          </span>
          <span>
            Relevance{" "}
            <span className="tabular-nums text-foreground">
              {email.relevance_score}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border bg-muted/20 p-5">
          <div className="grid grid-cols-2 gap-3">
            <ScoreBar
              label="Personalization"
              value={email.personalization_score}
              tone="primary"
            />
            <ScoreBar
              label="Relevance"
              value={email.relevance_score}
              tone="blue"
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Wand2 className="h-3.5 w-3.5" />
              Suggestions
            </p>
            <ul className="space-y-1.5">
              {email.ai_suggestions.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 rounded-lg border border-border bg-card p-2.5"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[10px] font-semibold text-primary-700">
                    {i + 1}
                  </span>
                  <p className="text-xs leading-relaxed text-foreground">{s}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function ScoreBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "primary" | "blue";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">{label}</span>
        <span className="tabular-nums text-foreground">{value}/100</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            tone === "primary" ? "bg-primary" : "bg-status-blue-fg",
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function ActionsBar({
  active,
  onApprove,
  onRegenerate,
  onSaveDraft,
  onEditAI,
}: {
  active: EmailDraft;
  onApprove: () => void;
  onRegenerate: () => void;
  onSaveDraft: () => void;
  onEditAI: () => void;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="text-xs text-muted-foreground">
          Editing{" "}
          <span className="font-medium text-foreground">
            Email {active.step} — {active.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={onEditAI}>
            <Wand2 className="h-4 w-4" />
            Edit with AI
          </Button>
          <Button variant="outline" onClick={onRegenerate}>
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <Button variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4" />
            Save draft
          </Button>
          <Button onClick={onApprove}>
            {active.status === "Approved" ? (
              <>
                <MailOpen className="h-4 w-4" />
                Approved
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Approve email
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
