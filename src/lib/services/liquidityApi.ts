import { apiFetch, getApiBaseUrl } from "@/lib/api/client";

export type rulesResponse = { data: any[]; message?: string };

/**
 * Fetch initial rules from the backend.
 * Returns an object with a `data` property for compatibility with callers.
 */
export const fetchInitialRules = async () => {
  try {
    const res = await apiFetch<any>("/rules");
    // If backend already returns { data: [...] } keep it, otherwise normalize
    if (res && typeof res === "object" && Object.prototype.hasOwnProperty.call(res, "data")) {
      return res;
    }
    return { data: res };
  } catch (err) {
    console.error("fetchInitialRules error:", err);
    throw err;
  }
};

/**
 * Upload a file to the backend for rule parsing.
 * Returns normalized { data } shape.
 */
export const uploadFile = async (file: File) => {
  try {
    const url = new URL("/rules/upload", getApiBaseUrl()).toString();
    const form = new FormData();
    form.append("file", file);

    const response = await fetch(url, {
      method: "POST",
      body: form,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Upload failed: ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json().catch(() => ({}));
    return { data };
  } catch (err) {
    console.error("uploadFile error:", err);
    throw err;
  }
};

/**
 * Send a rule-related command to the backend.
 * Returns normalized { data } shape.
 */
export const rulesResponse = async (input: string, sessionId: string) => {
  try {
    const url = new URL("/rules/command", getApiBaseUrl()).toString();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input, sessionId }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Command failed: ${response.status} ${response.statusText} ${text}`);
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    console.error("rulesResponse error:", err);
    throw err;
  }
};


export default {
  fetchInitialRules,
  uploadFile,
  rulesResponse,
};