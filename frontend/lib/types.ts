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

/* --- Contacts ----------------------------------------------------------- */

export type ContactStatus =
  | "Not Contacted"
  | "Queued"
  | "Contacted"
  | "Replied"
  | "Bounced"
  | "Unsubscribed";

export type Seniority = "C-Level" | "VP" | "Director" | "Manager" | "IC";

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  seniority: Seniority;
  email: string;
  company_id: string;
  company_name: string;
  industry: string;
  status: ContactStatus;
  tags: string[];
  added_at: string;
  last_activity_at?: string;
  last_activity?: string;
}

/* --- Dream list (Postgres) ---------------------------------------------- */

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
  tier?: string;
  is_g42_group?: boolean;
  slug?: string;
  description?: string;
  parent_company?: string;
  linkedin_url?: string;
  hq_city?: string;
  monitoring_enabled?: boolean;
}

/* --- Jobs / matching pipeline ------------------------------------------- */

export type CampaignMode = "auto" | "notify";

export interface JobSettings {
  workspace_id: string;
  daily_scan_enabled: boolean;
  daily_scan_time: string;
  timezone: string;
  weekly_summary_enabled: boolean;
  weekly_interval_days: number;
  weekly_run_day: number;
  campaign_mode: CampaignMode;
  min_opportunity_score: number;
  last_daily_run_at?: string | null;
  last_weekly_run_at?: string | null;
  updated_at?: string | null;
}

export interface JobStatus {
  settings: JobSettings;
  monitoring_enabled_count: number;
  total_companies: number;
  pending_decisions: number;
  daily_matches_7d: number;
  weekly_summaries_30d: number;
}

export interface MatchTableRow {
  match_id: string;
  company_id: string;
  company_name: string;
  match_date: string;
  news_article_1: Record<string, unknown>;
  service_match_1: Record<string, unknown>;
  news_article_2: Record<string, unknown>;
  service_match_2: Record<string, unknown>;
  news_article_3: Record<string, unknown>;
  service_match_3: Record<string, unknown>;
  condensed: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MatchSummaryRow {
  summary_id: string;
  company_id: string;
  company_name: string;
  summary_start_date: string;
  summary_end_date: string;
  summary_date: string;
  weekly_summary?: string | null;
  opportunity_score: number;
  created_at?: string;
}

export interface CampaignDecision {
  decision_id: string;
  company_id: string;
  summary_id?: string | null;
  company_name: string;
  opportunity_score: number;
  weekly_summary?: string | null;
  status: "pending" | "approved" | "dismissed";
  created_at: string;
  resolved_at?: string | null;
}

export interface JobRunResult {
  job: string;
  companies_processed: number;
  succeeded: number;
  failed: number;
  results: Record<string, unknown>[];
  message?: string | null;
}
