/**
 * Shared types for the Emitly frontend. These mirror the FastAPI backend
 * contract.
 */

export type CampaignStatus =
  | "Draft"
  | "In Progress"
  | "Ready to Send"
  | "Sent"
  | "Paused"
  | "Completed";

export type EmailStatus = "Draft" | "In Review" | "Approved" | "Sent";

export interface DashboardKpis {
  dream_companies: number;
  opportunities: number;
  emails_generated: number;
  ready_to_send: number;
}

export interface RecentCampaign {
  id: string;
  campaign: string;
  company: string;
  industry: string;
  opportunity_score: number;
  status: CampaignStatus;
  emails: number;
  updated: string;
}

export interface TopOpportunity {
  id: string;
  company: string;
  industry: string;
  opportunity_score: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  recent_campaigns: RecentCampaign[];
  top_opportunities: TopOpportunity[];
  activity_feed: ActivityItem[];
}

/* --- Company / Intelligence --------------------------------------------- */

export interface Company {
  id: string;
  name: string;
  website: string;
  industry: string;
  country: string;
  notes?: string;
  tags?: string[];
}

export interface LatestSignal {
  title: string;
  source: string;
  published_at: string;
  summary: string;
  url?: string;
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
}

export interface MatchedService {
  id: string;
  name: string;
  rationale: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  team?: string;
  reason: string;
}

export interface IntelligenceSource {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string;
}

export interface CompanyIntelligence {
  company: Company;
  opportunity_score: number;
  latest_signal: LatestSignal;
  initiative_summary: string;
  why_this_company: string;
  risks: Risk[];
  matched_services: MatchedService[];
  stakeholders: Stakeholder[];
  key_takeaway: string;
  sources: IntelligenceSource[];
}

/* --- Emails ------------------------------------------------------------- */

export interface PersonalizationReasons {
  recent_ai_initiative: string;
  detected_risks: string[];
  matched_services: string[];
  targeting: string;
  context_summary: string;
}

export interface EmailDraft {
  id: string;
  step: number;
  type: string; // e.g. "Initial Outreach"
  subject: string;
  body: string;
  status: EmailStatus;
  personalization_score: number;
  relevance_score: number;
  ai_suggestions: string[];
  updated: string;
}

export interface EmailWorkspaceData {
  campaign_id: string;
  campaign_name: string;
  company: Company;
  personalization: PersonalizationReasons;
  emails: EmailDraft[];
}

/* --- Campaign detail ---------------------------------------------------- */

export type TimelineStepStatus = "completed" | "in_progress" | "pending";

export interface CampaignTimelineStep {
  id: string;
  label: string;
  status: TimelineStepStatus;
  timestamp?: string;
  caption?: string;
}

export interface CampaignSummary {
  key_signal: string;
  industry: string;
  country: string;
  added_on: string;
  matched_services: string[];
  why_high_value: string;
}

export interface EmailSequenceSummary {
  id: string;
  step: number;
  type: string;
  subject: string;
  status: EmailStatus;
}

export interface CampaignDetail {
  id: string;
  name: string;
  company: Company;
  status: CampaignStatus;
  opportunity_score: number;
  emails_count: number;
  stakeholders_count: number;
  timeline: CampaignTimelineStep[];
  summary: CampaignSummary;
  email_sequence: EmailSequenceSummary[];
  activity: ActivityItem[];
}
