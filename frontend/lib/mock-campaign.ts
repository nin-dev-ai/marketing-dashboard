import type { CampaignDetail } from "@/lib/types";
import { getMockCompany } from "@/lib/mock-intelligence";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const iso = (offsetMs: number) =>
  new Date(Date.now() - offsetMs).toISOString();

interface SeedOpts {
  id: string;
  companyId: string;
  status?: CampaignDetail["status"];
  score?: number;
  emails?: number;
  stakeholders?: number;
  approved?: number; // number of approved emails so far
  addedDaysAgo?: number;
}

function seed(opts: SeedOpts): CampaignDetail {
  const company = getMockCompany(opts.companyId);
  const status = opts.status ?? "In Progress";
  const score = opts.score ?? 88;
  const emails = opts.emails ?? 3;
  const stakeholders = opts.stakeholders ?? 4;
  const approved = opts.approved ?? 1;
  const added = (opts.addedDaysAgo ?? 7) * DAY;

  return {
    id: opts.id,
    name: `${company.name} Outreach`,
    company,
    status,
    opportunity_score: score,
    emails_count: emails,
    stakeholders_count: stakeholders,
    timeline: [
      {
        id: "t1",
        label: "Company Added",
        status: "completed",
        timestamp: iso(added),
        caption: "Created by James Pasaporten",
      },
      {
        id: "t2",
        label: "AI Intelligence Generated",
        status: "completed",
        timestamp: iso(added - 1 * DAY),
        caption: `${stakeholders} stakeholders · ${emails} services matched`,
      },
      {
        id: "t3",
        label: "Emails Generated",
        status: "completed",
        timestamp: iso(added - 2 * DAY),
        caption: `${emails}-step sequence`,
      },
      {
        id: "t4",
        label: "Approved",
        status: approved >= emails ? "completed" : "in_progress",
        caption: `${approved} of ${emails} approved`,
      },
      {
        id: "t5",
        label: "Ready to Send",
        status:
          status === "Ready to Send" || status === "Sent"
            ? "completed"
            : "pending",
      },
      {
        id: "t6",
        label: "Sent",
        status: status === "Sent" ? "completed" : "pending",
      },
    ],
    summary: {
      key_signal: `${company.name} is investing heavily in AI infrastructure for ${company.industry.toLowerCase()} in the ${company.country}.`,
      industry: company.industry,
      country: company.country,
      added_on: iso(added),
      matched_services: [
        "AI Security Assessment",
        "AI Red Teaming",
        "Cloud Security Review",
        "AI Governance & Compliance",
      ],
      why_high_value:
        "High investment in AI paired with regulator scrutiny — ideal for security-anchored conversations.",
    },
    email_sequence: [
      {
        id: `${opts.id}-e1`,
        step: 1,
        type: "Initial Outreach",
        subject: `Strengthening ${company.name}'s AI infrastructure security`,
        status: approved >= 1 ? "Approved" : "Draft",
      },
      {
        id: `${opts.id}-e2`,
        step: 2,
        type: "Value Follow-up",
        subject: `${company.name} + AI red-teaming: a quick proof point`,
        status: approved >= 2 ? "Approved" : "Draft",
      },
      {
        id: `${opts.id}-e3`,
        step: 3,
        type: "Final Follow-up",
        subject: `Closing the loop — sovereign AI security for ${company.name}`,
        status: approved >= 3 ? "Approved" : "Draft",
      },
    ],
    activity: [
      {
        id: "a1",
        message: `Email ${Math.max(1, approved)} approved by James Pasaporten`,
        timestamp: iso(2 * HOUR),
      },
      {
        id: "a2",
        message: "AI suggestions regenerated for Email 2",
        timestamp: iso(5 * HOUR),
      },
      {
        id: "a3",
        message: "Email sequence drafted",
        timestamp: iso(added - 2 * DAY),
      },
      {
        id: "a4",
        message: "AI Intelligence generated",
        timestamp: iso(added - 1 * DAY),
      },
    ],
  };
}

const CAMPAIGNS: CampaignDetail[] = [
  seed({
    id: "core42",
    companyId: "core42",
    status: "Draft",
    score: 94,
    emails: 3,
    stakeholders: 5,
    approved: 1,
    addedDaysAgo: 7,
  }),
  seed({
    id: "presight",
    companyId: "presight",
    status: "In Progress",
    score: 88,
    emails: 2,
    stakeholders: 4,
    approved: 1,
    addedDaysAgo: 11,
  }),
  seed({
    id: "g42-healthcare",
    companyId: "g42-healthcare",
    status: "Ready to Send",
    score: 82,
    emails: 3,
    stakeholders: 6,
    approved: 3,
    addedDaysAgo: 14,
  }),
  seed({
    id: "bayanat",
    companyId: "bayanat",
    status: "In Progress",
    score: 76,
    emails: 1,
    stakeholders: 3,
    approved: 0,
    addedDaysAgo: 5,
  }),
];

export function getMockCampaignsList(): CampaignDetail[] {
  return CAMPAIGNS;
}

export function getMockCampaign(campaignId: string): CampaignDetail {
  return CAMPAIGNS.find((c) => c.id === campaignId) ?? CAMPAIGNS[0];
}
