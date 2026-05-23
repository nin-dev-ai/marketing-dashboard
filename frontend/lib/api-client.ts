/**
 * Minimal typed fetch wrapper for the Emitly FastAPI backend.
 *
 * Base URL is read from NEXT_PUBLIC_API_BASE_URL with a localhost default so
 * the dashboard still attempts a real network call in dev.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  readonly status: number;
  readonly url: string;
  readonly body?: unknown;

  constructor(message: string, opts: { status: number; url: string; body?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = opts.status;
    this.url = opts.url;
    this.body = opts.body;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** When true, response is returned as text rather than parsed JSON. */
  raw?: boolean;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, raw, headers, ...rest } = options;
  const url = path.startsWith("http")
    ? path
    : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: rest.cache ?? "no-store",
    });
  } catch (err) {
    throw new ApiError(
      err instanceof Error
        ? `Network error reaching API: ${err.message}`
        : "Network error reaching API",
      { status: 0, url },
    );
  }

  if (!response.ok) {
    let parsed: unknown = undefined;
    try {
      parsed = await response.json();
    } catch {
      // ignore — body wasn't JSON
    }
    throw new ApiError(
      `API request failed (${response.status} ${response.statusText})`,
      { status: response.status, url, body: parsed },
    );
  }

  if (raw) {
    return (await response.text()) as unknown as T;
  }

  // Tolerate empty responses
  const text = await response.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}
