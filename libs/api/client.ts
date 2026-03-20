// lib/api/client.ts
// Thin wrapper around your existing axios client.
// All auth (cookies, JWT refresh, Redux, vendor headers) is handled
// by the axios interceptors in createAxiosClient() — we just call it.
//
// Nothing in /lib/api/* should import axios directly.
// Always import { apiClient } from "@/lib/api/client" instead.

import { createAxiosClient } from "@/utils/clientFetch";   // ← your existing file
import type { ApiError } from "@/types/subscription";

// ─────────────────────────────────────────────────────────────────────────────
// Singleton axios instance
// createAxiosClient() sets up the request/response interceptors once.
// ─────────────────────────────────────────────────────────────────────────────

const axios = createAxiosClient();

// ─────────────────────────────────────────────────────────────────────────────
// Custom error class
// Normalises every axios error into a consistent shape so hooks can
// always read e.message without caring about axios internals.
// ─────────────────────────────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  status: number;
  body: ApiError;

  constructor(status: number, body: ApiError) {
    const message =
      body.error ??
      body.detail ??
      (Object.values(body)
        .flat()
        .filter((v) => typeof v === "string")
        .join(" ") ||
      `HTTP ${status}`);
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.body = body;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal helper — converts any axios error into ApiRequestError
// ─────────────────────────────────────────────────────────────────────────────

function normaliseError(error: unknown): never {
  // Axios error with a response (4xx / 5xx)
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const axiosError = error as {
      response: { status: number; data: unknown };
    };
    const { status, data } = axiosError.response;
    const body: ApiError =
      typeof data === "object" && data !== null
        ? (data as ApiError)
        : { error: String(data) };
    throw new ApiRequestError(status, body);
  }

  // Network error / no response (ECONNREFUSED, timeout, etc.)
  if (
    typeof error === "object" &&
    error !== null &&
    "request" in error
  ) {
    throw new ApiRequestError(0, {
      error: "Network error. Check your connection.",
    });
  }

  // Anything else
  throw new ApiRequestError(0, {
    error: error instanceof Error ? error.message : "An unexpected error occurred.",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Core request wrapper
// ─────────────────────────────────────────────────────────────────────────────

async function request<T>(
  method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  /** Extra per-call axios config (e.g. { signal } for AbortController) */
  config?: Record<string, unknown>
): Promise<T> {
  try {
    const response = await axios.request<T>({
      method,
      url: path,
      data: body,
      ...config,
    });

    return response.data;
  } catch (error) {
    normaliseError(error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — identical surface to the old client so every import in
// /lib/api/subscriptions.ts keeps working without any changes.
// ─────────────────────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, _opts?: { public?: boolean }) {
    // The `public` option was used by the old fetch client to skip the auth
    // header. With axios + cookies this is a no-op — the interceptor adds the
    // Authorization header only when the cookie exists, so public endpoints
    // work fine either way.
    return request<T>("GET", path);
  },

  post<T>(path: string, body?: unknown) {
    return request<T>("POST", path, body);
  },

  patch<T>(path: string, body?: unknown) {
    return request<T>("PATCH", path, body);
  },

  put<T>(path: string, body?: unknown) {
    return request<T>("PUT", path, body);
  },

  delete<T = void>(path: string) {
    return request<T>("DELETE", path);
  },
};