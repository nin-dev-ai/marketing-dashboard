"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ScoreBadge } from "@/components/shared/score-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import type { RecentCampaign } from "@/lib/types";

interface Props {
  campaigns: RecentCampaign[];
}

export function RecentCampaignsTable({ campaigns }: Props) {
  const router = useRouter();
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-3">
        <CardTitle className="text-base">Recent Campaigns</CardTitle>
        <Link
          href="/campaigns"
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-6">Campaign</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Opportunity Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Emails</TableHead>
              <TableHead className="pr-6 text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={7}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No campaigns yet. Add a dream company to get started.
                </TableCell>
              </TableRow>
            ) : (
              campaigns.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/campaigns/${c.id}`)}
                >
                  <TableCell className="pl-6 font-medium text-foreground">
                    {c.campaign}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-100 text-[11px] font-semibold uppercase text-primary">
                        {getInitials(c.company)}
                      </span>
                      <span className="font-medium text-foreground">
                        {c.company}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.industry}
                  </TableCell>
                  <TableCell>
                    <ScoreBadge score={c.opportunity_score} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-foreground">
                    {c.emails}
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground">
                    {formatRelativeTime(c.updated)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
