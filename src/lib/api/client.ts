const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://server-1-xk8a.onrender.com/api"

const API_BASE_URL = DEFAULT_API_BASE_URL
  // process.env.NEXT_PUBLIC_QDL_API_BASE_URL ?? DEFAULT_API_BASE_URL

export type ApiRequestInit = RequestInit & {
  next?: {
    revalidate?: number
    tags?: string[]
  }
}

// Add error handling to your fetch function
export async function apiFetch<T>(
  path: string,
  init: ApiRequestInit = {}
): Promise<T> {
  try {
    console.log("API Base URL:", API_BASE_URL)
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

    return (await response.json()) as T
  } catch (error) {
    console.error("API fetch error:", error)
    throw error
  }
}

export function getApiBaseUrl() {
  return API_BASE_URL
}
