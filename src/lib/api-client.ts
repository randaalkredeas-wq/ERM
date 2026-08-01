"use client";

export class ApiError extends Error {
  status: number;
  issues?: unknown;

  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers:
      init?.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json", ...init.headers }
        : init?.headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.error ?? `Request failed with status ${response.status}`,
      response.status,
      body.issues,
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get<T>(url: string) {
    return request<T>(url);
  },
  post<T>(url: string, body?: unknown) {
    return request<T>(url, {
      method: "POST",
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(url: string, body?: unknown) {
    return request<T>(url, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(url: string) {
    return request<T>(url, { method: "DELETE" });
  },
};
