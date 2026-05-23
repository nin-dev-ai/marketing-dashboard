import type { DashboardData } from "@/lib/types";

/**
 * Demo dataset used when the backend isn't reachable. Mirrors the wireframe
 * so the dashboard renders fully even before the FastAPI service exists.
 *
 * Timestamps are computed relative to "now" so the activity feed always
 * looks fresh.
 */
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const now = () => Date.now();
const iso = (offsetMs: number) => new Date(now() - offsetMs).toISOString();

export function getMockDashboard(): DashboardData {
  return {
    kpis: {
      dream_companies: 78,
      opportunities: 21,
      emails_generated: 162,
      ready_to_send: 14,
    },
    recent_campaigns: [
      {
        id: "cmp_001",
        campaign: "Core42 Outreach",
        company: "Core42",
        industry: "AI Cloud / Sovereign AI",
        opportunity_score: 94,
        status: "Ready to Send",
        emails: 3,
        updated: iso(2 * HOUR),
      },
      {
        id: "cmp_002",
        campaign: "Presight AI — Q2",
        company: "Presight AI",
        industry: "AI Analytics",
        opportunity_score: 88,
        status: "In Progress",
        emails: 2,
        updated: iso(5 * HOUR),
      },
      {
        id: "cmp_003",
        campaign: "G42 Healthcare Intro",
        company: "G42 Healthcare",
        industry: "Healthcare AI",
        opportunity_score: 82,
        status: "Ready to Send",
        emails: 3,
        updated: iso(1 * DAY),
      },
      {
        id: "cmp_004",
        campaign: "Bayanat — Geospatial",
        company: "Bayanat",
        industry: "Geospatial AI",
        opportunity_score: 76,
        status: "In Progress",
        emails: 1,
        updated: iso(2 * DAY),
      },
      {
        id: "cmp_005",
        campaign: "TII — Falcon Security",
        company: "Technology Innovation Institute",
        industry: "AI Research",
        opportunity_score: 71,
        status: "Draft",
        emails: 0,
        updated: iso(3 * DAY),
      },
    ],
    top_opportunities: [
      {
        id: "opp_001",
        company: "Core42",
        industry: "AI Security Assessment",
        opportunity_score: 94,
      },
      {
        id: "opp_002",
        company: "Presight AI",
        industry: "Data Governance Review",
        opportunity_score: 88,
      },
      {
        id: "opp_003",
        company: "G42 Healthcare",
        industry: "Cloud Security Review",
        opportunity_score: 82,
      },
      {
        id: "opp_004",
        company: "Bayanat",
        industry: "Model Risk Assessment",
        opportunity_score: 76,
      },
      {
        id: "opp_005",
        company: "Khazna Data Centers",
        industry: "Infrastructure Security",
        opportunity_score: 73,
      },
    ],
    activity_feed: [
      {
        id: "act_001",
        message: "AI Intelligence generated for Core42",
        timestamp: iso(45 * MIN),
      },
      {
        id: "act_002",
        message: "Email sequence approved for Presight AI",
        timestamp: iso(3 * HOUR),
      },
      {
        id: "act_003",
        message: "Campaign 'Bayanat — Geospatial' moved to In Progress",
        timestamp: iso(8 * HOUR),
      },
      {
        id: "act_004",
        message: "Mubadala AI added as a dream company",
        timestamp: iso(1 * DAY),
      },
      {
        id: "act_005",
        message: "3 new opportunities surfaced for G42 Healthcare",
        timestamp: iso(2 * DAY),
      },
    ],
  };
}
