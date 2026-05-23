"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  Building2,
  Check,
  Database,
  Key,
  Link2,
  Mail,
  Plug,
  Save,
  Slack,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, workspace, and how Emitly sends outreach."
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="profile">
            <User className="mr-1.5 h-3.5 w-3.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Building2 className="mr-1.5 h-3.5 w-3.5" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-1.5 h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            Email &amp; Sending
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="mr-1.5 h-3.5 w-3.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="mr-1.5 h-3.5 w-3.5" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSection />
        </TabsContent>

        <TabsContent value="workspace" className="space-y-6">
          <WorkspaceSection />
          <DangerZone />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsSection />
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailSendingSection />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsSection />
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <ApiKeysSection />
        </TabsContent>
      </Tabs>
    </>
  );
}

/* --- Profile ------------------------------------------------------------ */

function ProfileSection() {
  const [profile, setProfile] = useState({
    first_name: "James",
    last_name: "Pasaporten",
    email: "jpasaporten@emitly.ai",
    title: "Head of Growth",
    timezone: "Asia/Dubai",
  });

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">Personal Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          This information is visible to your teammates and used to sign your
          outreach emails.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-base">JP</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="outline" size="sm">
              Upload photo
            </Button>
            <Button variant="ghost" size="sm">
              Remove
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="first_name" label="First name">
            <Input
              id="first_name"
              value={profile.first_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, first_name: e.target.value }))
              }
            />
          </Field>
          <Field id="last_name" label="Last name">
            <Input
              id="last_name"
              value={profile.last_name}
              onChange={(e) =>
                setProfile((p) => ({ ...p, last_name: e.target.value }))
              }
            />
          </Field>
          <Field id="email" label="Email">
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
            />
          </Field>
          <Field id="title" label="Title">
            <Input
              id="title"
              value={profile.title}
              onChange={(e) =>
                setProfile((p) => ({ ...p, title: e.target.value }))
              }
            />
          </Field>
          <Field id="timezone" label="Time zone">
            <select
              id="timezone"
              value={profile.timezone}
              onChange={(e) =>
                setProfile((p) => ({ ...p, timezone: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option>Asia/Dubai</option>
              <option>Asia/Riyadh</option>
              <option>Europe/London</option>
              <option>America/New_York</option>
              <option>America/Los_Angeles</option>
            </select>
          </Field>
        </div>
      </CardContent>
      <SaveFooter onSave={() => toast.success("Profile saved.")} />
    </Card>
  );
}

/* --- Workspace ---------------------------------------------------------- */

const MEMBERS = [
  {
    id: "m1",
    name: "James Pasaporten",
    email: "jpasaporten@emitly.ai",
    role: "Owner",
  },
  {
    id: "m2",
    name: "Layla Karim",
    email: "layla@emitly.ai",
    role: "Admin",
  },
  {
    id: "m3",
    name: "Marcus Lee",
    email: "marcus@emitly.ai",
    role: "Editor",
  },
  {
    id: "m4",
    name: "Sara Ahmed",
    email: "sara@emitly.ai",
    role: "Viewer",
  },
];

function WorkspaceSection() {
  const [name, setName] = useState("Emitly Demo");
  const [domain, setDomain] = useState("emitly.ai");

  return (
    <>
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle className="text-base">Workspace</CardTitle>
          <p className="text-sm text-muted-foreground">
            Settings that apply to everyone in this workspace.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="ws_name" label="Workspace name">
              <Input
                id="ws_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field id="ws_domain" label="Email domain">
              <Input
                id="ws_domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Database className="h-4 w-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary-700">
                Pro plan
              </p>
              <p className="text-xs text-primary-700/80">
                500 emails/day · unlimited campaigns · AI red-teaming included
              </p>
            </div>
            <Button variant="outline" size="sm">
              Manage plan
            </Button>
          </div>
        </CardContent>
        <SaveFooter onSave={() => toast.success("Workspace saved.")} />
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <div>
            <CardTitle className="text-base">Members</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage who can access this workspace.
            </p>
          </div>
          <Button>Invite member</Button>
        </CardHeader>
        <CardContent className="p-0">
          {MEMBERS.map((m, i) => (
            <div
              key={m.id}
              className={cn(
                "flex items-center justify-between gap-3 px-6 py-3.5",
                i !== MEMBERS.length - 1 && "border-b border-border",
              )}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>
                    {m.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-foreground">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
                  {m.role}
                </span>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

/* --- Notifications ------------------------------------------------------ */

interface NotificationToggle {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const NOTIFICATIONS: NotificationToggle[] = [
  {
    id: "n1",
    label: "Email replies",
    description: "Notify me when a prospect replies to a sent email.",
    defaultValue: true,
  },
  {
    id: "n2",
    label: "Intelligence ready",
    description: "Notify me when AI Intelligence finishes for a new company.",
    defaultValue: true,
  },
  {
    id: "n3",
    label: "Campaign approved",
    description: "Notify me when a teammate approves a campaign for sending.",
    defaultValue: false,
  },
  {
    id: "n4",
    label: "Weekly digest",
    description: "Friday summary of activity, replies, and new opportunities.",
    defaultValue: true,
  },
  {
    id: "n5",
    label: "Product updates",
    description: "Occasional emails about new features and improvements.",
    defaultValue: false,
  },
];

function NotificationsSection() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATIONS.map((n) => [n.id, n.defaultValue])),
  );

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">Notifications</CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose what Emitly emails you about.
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border p-0">
        {NOTIFICATIONS.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between gap-4 px-6 py-4"
          >
            <div className="min-w-0 leading-snug">
              <p className="text-sm font-medium text-foreground">{n.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {n.description}
              </p>
            </div>
            <Switch
              checked={state[n.id]}
              onCheckedChange={(c) =>
                setState((s) => ({ ...s, [n.id]: c }))
              }
              aria-label={n.label}
            />
          </div>
        ))}
      </CardContent>
      <SaveFooter onSave={() => toast.success("Notification preferences saved.")} />
    </Card>
  );
}

/* --- Email & Sending ---------------------------------------------------- */

function EmailSendingSection() {
  const [fromEmail, setFromEmail] = useState("james@emitly.ai");
  const [fromName, setFromName] = useState("James Pasaporten");
  const [dailyLimit, setDailyLimit] = useState("80");
  const [signature, setSignature] = useState(
    "Best,\nJames Pasaporten\nHead of Growth · Emitly\nemitly.ai",
  );
  const [simulated, setSimulated] = useState(true);
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(false);

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">Email &amp; Sending</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure how outreach is sent. Live sending requires a provider
          (Resend, SendGrid, Gmail).
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field id="from_name" label="From name">
            <Input
              id="from_name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
            />
          </Field>
          <Field id="from_email" label="From email">
            <Input
              id="from_email"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
            />
          </Field>
          <Field id="daily_limit" label="Daily send limit">
            <Input
              id="daily_limit"
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </Field>
          <Field id="reply_to" label="Reply-to (optional)">
            <Input id="reply_to" placeholder="replies@yourdomain.com" />
          </Field>
        </div>

        <Field id="signature" label="Email signature">
          <Textarea
            id="signature"
            rows={5}
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="font-mono text-sm"
          />
        </Field>

        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
          <ToggleRow
            label="Simulated send"
            description="Mark emails as sent without actually delivering them. Recommended while you wire up a provider."
            checked={simulated}
            onChange={setSimulated}
            highlight
          />
          <ToggleRow
            label="Track opens"
            description="Add a pixel to detect when prospects open emails."
            checked={trackOpens}
            onChange={setTrackOpens}
          />
          <ToggleRow
            label="Track link clicks"
            description="Rewrite links so click-through can be measured."
            checked={trackClicks}
            onChange={setTrackClicks}
          />
        </div>
      </CardContent>
      <SaveFooter onSave={() => toast.success("Email preferences saved.")} />
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  highlight,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 leading-snug">
        <p
          className={cn(
            "text-sm font-medium",
            highlight ? "text-primary-700" : "text-foreground",
          )}
        >
          {label}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

/* --- Integrations ------------------------------------------------------- */

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  connected: boolean;
}

function IntegrationsSection() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "resend",
      name: "Resend",
      description: "Transactional email API for live sending.",
      icon: <Mail className="h-5 w-5" />,
      connected: false,
    },
    {
      id: "slack",
      name: "Slack",
      description: "Push reply alerts and weekly digests to a channel.",
      icon: <Slack className="h-5 w-5" />,
      connected: true,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Sync contacts and activity to your CRM.",
      icon: <Link2 className="h-5 w-5" />,
      connected: false,
    },
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Push qualified replies to your sales pipeline.",
      icon: <Database className="h-5 w-5" />,
      connected: false,
    },
  ]);

  function toggle(id: string) {
    setIntegrations((list) =>
      list.map((i) => (i.id === id ? { ...i, connected: !i.connected } : i)),
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-border">
        <CardTitle className="text-base">Integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect Emitly to the tools your team already uses.
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
        {integrations.map((i) => (
          <div
            key={i.id}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary">
              {i.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">
                  {i.name}
                </p>
                {i.connected ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-green-bg px-2 py-0.5 text-[11px] font-medium text-status-green-fg">
                    <Check className="h-3 w-3" />
                    Connected
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {i.description}
              </p>
              <div className="mt-3">
                <Button
                  variant={i.connected ? "outline" : "default"}
                  size="sm"
                  onClick={() => toggle(i.id)}
                >
                  {i.connected ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/* --- API Keys ----------------------------------------------------------- */

function ApiKeysSection() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-border">
        <div>
          <CardTitle className="text-base">API Keys</CardTitle>
          <p className="text-sm text-muted-foreground">
            Programmatic access to the Emitly API.
          </p>
        </div>
        <Button>Create new key</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Production
            </p>
            <p className="text-xs text-muted-foreground">
              Created Apr 2026 · last used 2h ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              em_live_••••••a92f
            </code>
            <Button variant="ghost" size="sm">
              Revoke
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-6 py-3.5">
          <div>
            <p className="text-sm font-medium text-foreground">
              Development
            </p>
            <p className="text-xs text-muted-foreground">
              Created Mar 2026 · last used 5d ago
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
              em_test_••••••3c11
            </code>
            <Button variant="ghost" size="sm">
              Revoke
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* --- Danger Zone -------------------------------------------------------- */

function DangerZone() {
  return (
    <Card className="border-destructive/30">
      <CardHeader className="border-b border-destructive/20">
        <CardTitle className="flex items-center gap-2 text-base text-destructive">
          <AlertTriangle className="h-4 w-4" />
          Danger zone
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-foreground">
            Delete this workspace
          </p>
          <p className="text-xs text-muted-foreground">
            Permanently removes all companies, campaigns, contacts and emails.
            This action cannot be undone.
          </p>
        </div>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" />
          Delete workspace
        </Button>
      </CardContent>
    </Card>
  );
}

/* --- Shared helpers ----------------------------------------------------- */

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function SaveFooter({ onSave }: { onSave: () => void }) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
      <Button variant="ghost">Reset</Button>
      <Button onClick={onSave}>
        <Save className="h-4 w-4" />
        Save changes
      </Button>
    </div>
  );
}
