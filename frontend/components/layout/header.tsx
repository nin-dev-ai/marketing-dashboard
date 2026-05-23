"use client";

import { Bell, HelpCircle, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search companies, campaigns…"
          className="h-10 rounded-full border-border bg-muted/60 pl-9 pr-4 text-sm shadow-none focus-visible:bg-card"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Help"
          className="hidden h-9 w-9 rounded-full text-muted-foreground hover:text-foreground sm:inline-flex"
        >
          <HelpCircle className="h-[18px] w-[18px]" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </Button>
        <div className="ml-1 hidden flex-col text-right leading-tight sm:flex">
          <span className="text-sm font-medium text-foreground">
            James Pasaporten
          </span>
          <span className="text-xs text-muted-foreground">ID #42210</span>
        </div>
        <Avatar className="h-9 w-9">
          <AvatarFallback>JP</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
