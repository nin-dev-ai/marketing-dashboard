import type { Company } from "@/lib/types";

export type DreamCompanyStatus =
  | "New"
  | "Researching"
  | "Intelligence Ready"
  | "Active Campaign"
  | "Sent"
  | "Archived";

export interface DreamCompany extends Company {
  status: DreamCompanyStatus;
  opportunity_score: number;
  stakeholders_count: number;
  campaigns_count: number;
  emails_count: number;
  last_signal?: string;
  added_at: string;
  updated_at: string;
}

const DAY = 24 * 60 * 60 * 1000;
const iso = (offsetMs: number) =>
  new Date(Date.now() - offsetMs).toISOString();

export function getMockDreamCompanies(): DreamCompany[] {
  return [
    {
      id: "core42",
      name: "Core42",
      website: "https://core42.ai",
      industry: "AI Infrastructure",
      country: "United Arab Emirates",
      tags: ["Healthcare", "Sovereign AI"],
      status: "Active Campaign",
      opportunity_score: 94,
      stakeholders_count: 5,
      campaigns_count: 1,
      emails_count: 3,
      last_signal: "Launched sovereign AI cloud for healthcare",
      added_at: iso(8 * DAY),
      updated_at: iso(0.1 * DAY),
    },
    {
      id: "presight",
      name: "Presight AI",
      website: "https://presight.ai",
      industry: "AI Analytics",
      country: "United Arab Emirates",
      tags: ["Government", "Analytics"],
      status: "Intelligence Ready",
      opportunity_score: 88,
      stakeholders_count: 4,
      campaigns_count: 1,
      emails_count: 2,
      last_signal: "Expanded analytics platform across MENA",
      added_at: iso(11 * DAY),
      updated_at: iso(0.5 * DAY),
    },
    {
      id: "g42-healthcare",
      name: "G42 Healthcare",
      website: "https://g42healthcare.ai",
      industry: "Healthcare AI",
      country: "United Arab Emirates",
      tags: ["Healthcare", "Genomics"],
      status: "Active Campaign",
      opportunity_score: 82,
      stakeholders_count: 6,
      campaigns_count: 2,
      emails_count: 6,
      last_signal: "Announced genomics partnership with regulator",
      added_at: iso(14 * DAY),
      updated_at: iso(1 * DAY),
    },
    {
      id: "bayanat",
      name: "Bayanat",
      website: "https://bayanat.ae",
      industry: "Geospatial AI",
      country: "United Arab Emirates",
      tags: ["Geospatial", "Defence"],
      status: "Researching",
      opportunity_score: 76,
      stakeholders_count: 3,
      campaigns_count: 1,
      emails_count: 1,
      last_signal: "Raised geospatial AI strategic round",
      added_at: iso(5 * DAY),
      updated_at: iso(2 * DAY),
    },
    {
      id: "tii",
      name: "Technology Innovation Institute",
      website: "https://tii.ae",
      industry: "AI Research",
      country: "United Arab Emirates",
      tags: ["Research", "Open Source"],
      status: "Intelligence Ready",
      opportunity_score: 71,
      stakeholders_count: 4,
      campaigns_count: 0,
      emails_count: 0,
      last_signal: "Open-sourced Falcon foundation model update",
      added_at: iso(17 * DAY),
      updated_at: iso(3 * DAY),
    },
    {
      id: "khazna",
      name: "Khazna Data Centers",
      website: "https://khazna.com",
      industry: "Data Centers",
      country: "United Arab Emirates",
      tags: ["Infrastructure"],
      status: "New",
      opportunity_score: 68,
      stakeholders_count: 1,
      campaigns_count: 0,
      emails_count: 0,
      last_signal: "Expanded UAE hyperscaler capacity",
      added_at: iso(1 * DAY),
      updated_at: iso(1 * DAY),
    },
    {
      id: "mubadala-ai",
      name: "Mubadala AI",
      website: "https://mubadala.com/ai",
      industry: "AI Investment",
      country: "United Arab Emirates",
      tags: ["Investment", "Strategy"],
      status: "Researching",
      opportunity_score: 65,
      stakeholders_count: 2,
      campaigns_count: 0,
      emails_count: 0,
      last_signal: "Announced AI portfolio expansion",
      added_at: iso(4 * DAY),
      updated_at: iso(2 * DAY),
    },
    {
      id: "saudi-aramco-digital",
      name: "Aramco Digital",
      website: "https://aramcodigital.com",
      industry: "Energy AI",
      country: "Saudi Arabia",
      tags: ["Energy", "Industrial"],
      status: "New",
      opportunity_score: 62,
      stakeholders_count: 1,
      campaigns_count: 0,
      emails_count: 0,
      last_signal: "Spun out digital arm with AI mandate",
      added_at: iso(2 * DAY),
      updated_at: iso(2 * DAY),
    },
  ];
}
