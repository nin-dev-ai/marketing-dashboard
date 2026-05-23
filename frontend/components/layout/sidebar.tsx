"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronsUpDown,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const NAV: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Dream Companies", href: "/dream-companies", icon: Building2 },
  { label: "Campaigns", href: "/campaigns", icon: Megaphone },
  { label: "Intelligence", href: "/intelligence", icon: Sparkles },
  { label: "Email Workspace", href: "/email-workspace", icon: Mail },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
      <div className="mb-5 flex items-center gap-2.5 px-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sprout className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            emitly
          </span>
          <span className="text-[11px] uppercase tracking-wider text-sidebar-muted">
            My Workspace
          </span>
        </div>
      </div>

      <button
        type="button"
        className="mb-6 flex items-center justify-between rounded-lg border border-sidebar-border bg-card px-3 py-2 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-100 text-[11px] font-semibold uppercase text-primary">
            EM
          </span>
          <span className="leading-tight">
            <span className="block text-xs text-sidebar-muted">Workspace</span>
            <span className="block text-sm">Emitly Demo</span>
          </span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-sidebar-muted" />
      </button>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-primary-100/60 hover:text-primary-700",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active
                    ? "text-sidebar-active-foreground"
                    : "text-sidebar-muted group-hover:text-primary-700",
                )}
                strokeWidth={1.75}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-sidebar-border bg-card px-3 py-2.5 shadow-sm">
        <Avatar className="h-9 w-9">
          <AvatarFallback>JP</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-foreground">
            James Pasaporten
          </p>
          <p className="truncate text-xs text-sidebar-muted">
            jpasaporten@emitly.ai
          </p>
        </div>
      </div>
    </aside>
  );
}
