const DEFAULT_API_BASE_URL = "http://localhost:5005"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_QDL_API_BASE_URL ?? DEFAULT_API_BASE_URL

export type ApiRequestInit = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  const url = new URL(path, API_BASE_URL)
  const headers = new Headers(init.headers ?? {})

  if (!headers.has("accept")) {
    headers.set("accept", "application/json")
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  })

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    )
  }

  try {
    return (await response.json()) as T
  } catch {
    throw new Error("Failed to parse API response as JSON")
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL
}
