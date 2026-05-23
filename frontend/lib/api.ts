import { apiFetch } from "@/lib/api-client";
import type { DashboardData } from "@/lib/types";

/** GET /api/dashboard — KPIs + recent campaigns + opportunities + activity. */
export function getDashboard(signal?: AbortSignal): Promise<DashboardData> {
  return apiFetch<DashboardData>("/api/dashboard", { signal });
}
