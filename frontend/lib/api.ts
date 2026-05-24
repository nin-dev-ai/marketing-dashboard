import { apiFetch } from "@/lib/api-client";
import type {
  CampaignDecision,
  CampaignDetail,
  Company,
  CompanyIntelligence,
  DashboardData,
  DreamCompany,
  EmailDraft,
  EmailWorkspaceData,
  JobRunResult,
  JobSettings,
  JobStatus,
  MatchSummaryRow,
  MatchTableRow,
} from "@/lib/types";

/** GET /api/dream-companies — Postgres dream list */
export function getDreamCompanies(
  signal?: AbortSignal,
): Promise<DreamCompany[]> {
  return apiFetch<DreamCompany[]>("/api/dream-companies", { signal });
}

/** GET /api/dream-companies/{companyId} */
export function getDreamCompany(
  companyId: string,
  signal?: AbortSignal,
): Promise<DreamCompany> {
  return apiFetch<DreamCompany>(`/api/dream-companies/${companyId}`, { signal });
}

/** GET /api/dashboard */
export function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return apiFetch<DashboardData>("/api/dashboard", { signal });
}

export interface CompanyCreatePayload {
  company_name: string;
  website?: string;
  industry?: string;
  country?: string;
  notes?: string;
  linkedin_url?: string;
}

/** POST /api/companies */
export function createCompany(
  payload: CompanyCreatePayload,
): Promise<Company> {
  return apiFetch<Company>("/api/companies", {
    method: "POST",
    body: payload,
  });
}

export interface IntelligenceGeneratePayload {
  company_id?: string;
  company_name?: string;
  website?: string;
  industry?: string;
  country?: string;
  notes?: string;
  linkedin_url?: string;
}

/** POST /api/intelligence/generate */
export function generateIntelligence(
  payload: IntelligenceGeneratePayload,
): Promise<CompanyIntelligence> {
  return apiFetch<CompanyIntelligence>("/api/intelligence/generate", {
    method: "POST",
    body: payload,
  });
}

/** GET /api/intelligence/{companyId} */
export function getIntelligence(
  companyId: string,
  signal?: AbortSignal,
): Promise<CompanyIntelligence> {
  return apiFetch<CompanyIntelligence>(`/api/intelligence/${companyId}`, {
    signal,
  });
}

/** POST /api/emails/generate */
export function generateEmails(payload: {
  company_id: string;
  intelligence_id?: string;
}): Promise<{ campaign_id: string; emails: EmailDraft[] }> {
  return apiFetch("/api/emails/generate", {
    method: "POST",
    body: payload,
  });
}

/** GET /api/email-workspace/{campaignId} */
export function getEmailWorkspace(
  campaignId: string,
  signal?: AbortSignal,
): Promise<EmailWorkspaceData> {
  return apiFetch<EmailWorkspaceData>(`/api/email-workspace/${campaignId}`, {
    signal,
  });
}

/** PATCH /api/emails/{emailId} */
export function updateEmail(
  emailId: string,
  patch: { subject?: string; body?: string; status?: EmailDraft["status"] },
): Promise<EmailDraft> {
  return apiFetch<EmailDraft>(`/api/emails/${emailId}`, {
    method: "PATCH",
    body: patch,
  });
}

/** GET /api/campaigns/{campaignId} */
export function getCampaign(
  campaignId: string,
  signal?: AbortSignal,
): Promise<CampaignDetail> {
  return apiFetch<CampaignDetail>(`/api/campaigns/${campaignId}`, { signal });
}

/** POST /api/campaigns/{campaignId}/simulate-send */
export function simulateCampaignSend(
  campaignId: string,
): Promise<{ status: string; campaign_id: string }> {
  return apiFetch(`/api/campaigns/${campaignId}/simulate-send`, {
    method: "POST",
  });
}

/** GET /api/jobs/status */
export function getJobStatus(signal?: AbortSignal): Promise<JobStatus> {
  return apiFetch<JobStatus>("/api/jobs/status", { signal });
}

/** GET /api/jobs/settings */
export function getJobSettings(signal?: AbortSignal): Promise<JobSettings> {
  return apiFetch<JobSettings>("/api/jobs/settings", { signal });
}

export type JobSettingsPatch = Partial<
  Pick<
    JobSettings,
    | "daily_scan_enabled"
    | "daily_scan_time"
    | "timezone"
    | "weekly_summary_enabled"
    | "weekly_interval_days"
    | "weekly_run_day"
    | "campaign_mode"
    | "min_opportunity_score"
  >
>;

/** PATCH /api/jobs/settings */
export function updateJobSettings(
  patch: JobSettingsPatch,
): Promise<JobSettings> {
  return apiFetch<JobSettings>("/api/jobs/settings", {
    method: "PATCH",
    body: patch,
  });
}

/** GET /api/jobs/match-table */
export function getMatchTable(
  params?: { company_id?: string; limit?: number },
  signal?: AbortSignal,
): Promise<MatchTableRow[]> {
  const qs = new URLSearchParams();
  if (params?.company_id) qs.set("company_id", params.company_id);
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<MatchTableRow[]>(`/api/jobs/match-table${suffix}`, { signal });
}

/** GET /api/jobs/match-summary */
export function getMatchSummaries(
  params?: { company_id?: string; limit?: number },
  signal?: AbortSignal,
): Promise<MatchSummaryRow[]> {
  const qs = new URLSearchParams();
  if (params?.company_id) qs.set("company_id", params.company_id);
  if (params?.limit) qs.set("limit", String(params.limit));
  const suffix = qs.toString() ? `?${qs}` : "";
  return apiFetch<MatchSummaryRow[]>(`/api/jobs/match-summary${suffix}`, {
    signal,
  });
}

/** GET /api/jobs/pending-decisions */
export function getPendingDecisions(
  signal?: AbortSignal,
): Promise<CampaignDecision[]> {
  return apiFetch<CampaignDecision[]>("/api/jobs/pending-decisions", { signal });
}

/** POST /api/jobs/pending-decisions/{id}/approve */
export function approveCampaignDecision(
  decisionId: string,
): Promise<CampaignDecision> {
  return apiFetch<CampaignDecision>(
    `/api/jobs/pending-decisions/${decisionId}/approve`,
    { method: "POST" },
  );
}

/** POST /api/jobs/pending-decisions/{id}/dismiss */
export function dismissCampaignDecision(
  decisionId: string,
): Promise<CampaignDecision> {
  return apiFetch<CampaignDecision>(
    `/api/jobs/pending-decisions/${decisionId}/dismiss`,
    { method: "POST" },
  );
}

/** POST /api/jobs/run/daily */
export function runDailyJob(): Promise<JobRunResult> {
  return apiFetch<JobRunResult>("/api/jobs/run/daily", { method: "POST" });
}

/** POST /api/jobs/run/weekly */
export function runWeeklyJob(): Promise<JobRunResult> {
  return apiFetch<JobRunResult>("/api/jobs/run/weekly", { method: "POST" });
}

/** PATCH /api/dream-companies/{companyId}/monitoring */
export function setDreamCompanyMonitoring(
  companyId: string,
  monitoring_enabled: boolean,
): Promise<DreamCompany> {
  return apiFetch<DreamCompany>(`/api/dream-companies/${companyId}/monitoring`, {
    method: "PATCH",
    body: { monitoring_enabled },
  });
}
