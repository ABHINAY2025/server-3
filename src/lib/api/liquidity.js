import axios from "axios";

// Configure axios defaults and error handling
const API_BASE = "http://10.30.0.21:8088/api";

// Add request interceptors for loading state and error handling
axios.interceptors.request.use(
  (response) => response,
  (error) => {
    // Handle network errors gracefully
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      // Return a rejected promise with a more user-friendly error
      return Promise.reject({
        ...error,
        message: "Service temporarily unavailable",
        isNetworkError: true,
      });
    }
    return Promise.reject(error);
  }
);

//overview
export const overviewData = () => axios.get(`${API_BASE}/overview`);

// Helper function to extract overview data from the new array format
export const getOverviewData = async (setLoadingState, options) => {
  try {
    if (setLoadingState) setLoadingState(true);

    const activeTab = options?.activeTab;

    // Optionally use activeTab in the API call
    const url = `${API_BASE}/overview${activeTab ? `?tab=${activeTab}` : ""}`;
    const response = await axios.get(url);

    const data =
      response.data && Array.isArray(response.data) && response.data.length > 0
        ? response.data[0]
        : response.data;

    return data;
  } catch (error) {
    throw error;
  } finally {
    if (setLoadingState) setLoadingState(false);
  }
};

// Overview via SSE
// Get Investment Suggestions from AI Predictions API
export const getInvestmentSuggestions = async () => {
  try {
    const response = await axios.get(`http://10.30.0.21:8088/api/ai-predictions`);
    return response.data;
  } catch (error) {
    console.error("Error fetching investment suggestions:", error);
    throw error;
  }
};

export const overviewDataSSE = (onMessage, onHeartbeat, onError) => {
  try {
    const eventSource = new EventSource(`${API_BASE}/flow_chart/sse`);

    // Default message handler (for unnamed events)
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (parseError) {
        if (onError) onError(parseError);
      }
    };

    // Listen for 'overview' events
    eventSource.addEventListener("overview", (event) => {
      try {
        const rawData = JSON.parse(event.data);
        // Extract the actual data from the wrapper
        const data = rawData.data || rawData;
        onMessage(data);
      } catch (parseError) {
        if (onError) onError(parseError);
      }
    });

    // Listen for 'heartbeat' events
    eventSource.addEventListener("heartbeat", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onHeartbeat) onHeartbeat(data);
      } catch (parseError) {
        // Heartbeat parse errors are less critical
        console.warn("Heartbeat parse error:", parseError);
      }
    });

    // Listen for 'notifications' events
    eventSource.addEventListener("notifications", (event) => {
      try {
        const notifications = JSON.parse(event.data);
        // You can handle notifications separately if needed
        console.log("Received notifications:", notifications);
      } catch (parseError) {
        console.warn("Notifications parse error:", parseError);
      }
    });

    // Error handling
    eventSource.onerror = (err) => {
      console.error("SSE Connection error:", err);
      if (onError) onError(err);
      // Don't automatically close on error - let the browser handle reconnection
    };

    return eventSource;
  } catch (error) {
    // Handle any errors in creating the EventSource
    console.error("Failed to create SSE connection:", error);
    if (onError) onError(error);
    return null;
  }
};

//insights
export const fetchHierarchy = () => axios.get(`${API_BASE}/funds/getAll`);

export const createNode = async ({
  nodeKey,
  name,
  amount,
  parentKey ,
  type = "",
}) => {
  const response = await axios.post(`${API_BASE}/funds/create`, {
    nodeKey,
    name,
    amount,
    parentKey,
    type,
  });
  return response;
};

export const updateNode = (node) =>
  axios.put(`${API_BASE}/funds/nodes/${node.key}`, node);

export const deleteNode = (key) =>
  axios.delete(`${API_BASE}/funds/delete/${key}`);

export const counterpartyData = () =>
  axios.get(`${API_BASE}/counterparty-positions`);

export const counterpartyActivate = async (counterpartyName) => {
  const response = await axios.post(
    `${API_BASE}/counterparty/activate?counterpartyName=${counterpartyName}`
  );

  // Just clear the cache so next fetch will get fresh data
  // but don't make an extra API call now
  counterpartyCache.clear();

  return response;
};

export const counterpartyDeactivate = async (counterpartyName) => {
  const response = await axios.post(
    `${API_BASE}/counterparty/deactivate?counterpartyName=${counterpartyName}`
  );

  // Just clear the cache so next fetch will get fresh data
  // but don't make an extra API call now
  counterpartyCache.clear();

  return response;
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_BASE}/upload-file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const chatResponse = async (query) => {
  try {
    console.log("Sending query to API:", query);
    const response = await axios.post(`${API_BASE}/send-query`, query, {
      timeout: 600000, // 60  second timeout
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Received API response:", response.data);
    return response;
  } catch (error) {
    console.error("Error in chatResponse API call:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Fetch all rules on initial load
export const fetchInitialRules = async (sessionId = "mysession1") => {
  try {
    console.log("Fetching initial rules");
    const response = await axios.post(
      `${API_BASE}/chat`,
      {
        message: "show rules",
        session_id: sessionId,
      },
      {
        timeout: 1200000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Received initial rules:", response.data);
    return response;
  } catch (error) {
    console.error("Error fetching initial rules:", error);
    if (error.response) {
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

export const rulesResponse = async (message, sessionId = "mysession1") => {
  try {
    console.log("Sending message to API:", message);
    const response = await axios.post(
      `${API_BASE}/chat`,
      {
        message,
        session_id: sessionId,
      },
      {
        timeout: 1200000, // 20 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Received API response:", response.data);
    return response;
  } catch (error) {
    console.error("Error in rulesResponse API call:", error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// Retry manager for handling failed requests with exponential backoff
class RetryManager {
  constructor(maxRetries = 3) {
    this.retryMap = new Map();
    this.maxRetries = maxRetries;
  }

  shouldRetry(endpoint) {
    // Get current retry count
    const retryInfo = this.retryMap.get(endpoint) || {
      count: 0,
      nextRetryTime: 0,
    };

    // Check if we've hit the max retries
    if (retryInfo.count >= this.maxRetries) {
      console.log(
        `[RetryManager] Max retries (${this.maxRetries}) reached for ${endpoint}. Giving up.`
      );
      // Reset after a longer timeout to allow retries again in the future
      setTimeout(() => {
        this.retryMap.delete(endpoint);
        console.log(`[RetryManager] Retry count reset for ${endpoint}`);
      }, 120000); // Reset after 2 minutes of no retries
      return false;
    }

    // Check if we need to wait before retrying
    const now = Date.now();
    if (now < retryInfo.nextRetryTime) {
      console.log(
        `[RetryManager] Too soon to retry ${endpoint}. Next retry in ${Math.round((retryInfo.nextRetryTime - now) / 1000)}s`
      );
      return false;
    }

    // Calculate exponential backoff: 2^retry * 1000ms + random jitter
    const backoff = Math.min(
      30000,
      Math.pow(2, retryInfo.count) * 1000 + Math.random() * 1000
    );
    const nextRetryTime = now + backoff;

    // Update retry info
    this.retryMap.set(endpoint, {
      count: retryInfo.count + 1,
      nextRetryTime,
    });

    console.log(
      `[RetryManager] Retry ${retryInfo.count + 1}/${this.maxRetries} for ${endpoint}. Next retry in ${Math.round(backoff / 1000)}s`
    );
    return true;
  }

  reset(endpoint) {
    this.retryMap.delete(endpoint);
  }
}

// Create retry manager instance
const retryManager = new RetryManager(3);

// Enhanced API service with caching
class ApiCache {
  constructor(ttl = 5 * 60 * 1000) {
    // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Create cache instances
const apiCache = new ApiCache();
const counterpartyCache = new ApiCache(2 * 60 * 1000); // 2 minutes for real-time data
const snapshotCache = new ApiCache(1 * 60 * 1000); // 1 minute for snapshot data

// Optimized API functions with caching
export const fetchHierarchyOptimized = async () => {
  const cacheKey = "hierarchy";
  const endpoint = "hierarchy";

  // Check cache first
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  try {
    const response = await fetchHierarchy();
    // On success, reset the retry counter
    retryManager.reset(endpoint);

    let data = response.data;

    // Ensure we have a valid array of nodes
    if (!Array.isArray(data)) {
      data = data?.nodes || [];
    }

    // Process the data to ensure all required fields
    const processNode = (node) => ({
      ...node,
      id: node.id || undefined,
      key: node.key || node.nodeKey || `node-${node.id || Date.now()}`,
      nodeKey: node.nodeKey || node.key || `node-${node.id || Date.now()}`,
      name: node.name || "",
      amount: typeof node.amount === "number" ? node.amount : 0,
      parentKey: node.parentKey || null,
      type: node.type || "pool",
      level: node.level || 1,
      currency: node.currency || "USD",
      status: node.status || "active",
      children: Array.isArray(node.children)
        ? node.children.map((child) =>
            processNode({
              ...child,
              level: (node.level || 1) + 1, // Ensure consistent level hierarchy
            })
          )
        : [],
    });

    const processedData = data.map((node) => processNode(node));
    console.log("Processed hierarchy data:", processedData);

    apiCache.set(cacheKey, processedData);
    return { data: processedData, fromCache: false };
  } catch (error) {
    console.error("Error fetching hierarchy:", error);

    // Check if it's a network error and if we should retry
    if (
      (error.isNetworkError ||
        error.message === "Network Error" ||
        error.code === "ECONNABORTED") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[RetryManager] Will retry hierarchy fetch later`);
    } else {
      console.log(
        `[RetryManager] Not retrying hierarchy fetch: ${error.message}`
      );
    }

    // Return empty data instead of throwing to prevent uncaught errors
    return { data: [], fromCache: false, error: true };
  }
};

export const fetchCounterpartyDataOptimized = async (
  companies = ["default"]
) => {
  const cacheKey = `counterparty_${companies.sort().join("_")}`;
  const endpoint = "counterparty";

  // Check cache first for real-time data (shorter TTL)
  const cached = counterpartyCache.get(cacheKey);
  if (cached) {
    return { data: cached, fromCache: true };
  }

  try {
    // Use the original working API
    const response = await counterpartyData();

    // On success, reset the retry counter
    retryManager.reset(endpoint);

    // Handle both old and new API response formats
    const data = response.data?.nodes || response.data || [];

    counterpartyCache.set(cacheKey, data);
    return { data, fromCache: false };
  } catch (error) {
    console.error("Error fetching counterparty data:", error);

    // Check if it's a network error and if we should retry
    if (
      (error.isNetworkError ||
        error.message === "Network Error" ||
        error.code === "ECONNABORTED") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[RetryManager] Will retry counterparty fetch later`);
    } else {
      console.log(
        `[RetryManager] Not retrying counterparty fetch: ${error.message}`
      );
    }

    // Return empty data instead of throwing to prevent uncaught errors
    return { data: [], fromCache: false, error: true };
  }
};

export const fetchOverviewDataOptimized = async (options = {}) => {
  const {
    activeTab = "snapshot",
    skipFetch = false,
    forceRefresh = false,
    skipSetupSSE = false,
  } = options;

  const cacheKey = "overview_snapshot";
  const endpoint = "overview";

  // If we're not on the snapshot tab and not forcing a refresh, just return cached data
  if (activeTab !== "snapshot" && !forceRefresh) {
    // Check cache first
    const cached = snapshotCache.get(cacheKey);
    if (cached) {
      // For cached data when not on snapshot tab, return immediately with no delay
      return { data: cached, fromCache: true };
    } else if (skipFetch) {
      // If we don't have cached data and skipFetch is true, return empty data
      return { data: {}, fromCache: false };
    }
  }

  // For snapshot tab or if forcing refresh, proceed with normal flow
  // Check cache first (even for snapshot tab)
  const cached = snapshotCache.get(cacheKey);
  if (cached && !forceRefresh) {
    // Even for cached data, add a small delay to ensure loading states are visible
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { data: cached, fromCache: true };
  }

  try {
    // Add a small delay before making the request to ensure loading states are visible
    await new Promise((resolve) => setTimeout(resolve, 300));

    const response = await overviewData();

    // On success, reset the retry counter
    retryManager.reset(endpoint);

    const data = response.data;
    snapshotCache.set(cacheKey, data);

    // Add a small delay after receiving data to ensure loading states are visible
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { data, fromCache: false };
  } catch (error) {
    // Add a delay even on error to ensure loading states are visible
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.error("Error fetching overview data:", error);

    // Check if it's a network error and if we should retry
    if (
      (error.isNetworkError ||
        error.message === "Network Error" ||
        error.code === "ECONNABORTED") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[RetryManager] Will retry overview fetch later`);
    } else {
      console.log(
        `[RetryManager] Not retrying overview fetch: ${error.message}`
      );
    }

    // Return empty data instead of throwing to prevent uncaught errors
    return { data: {}, fromCache: false, error: true };
  }
};

// Preload critical data
export const preloadDashboardData = async (options = {}) => {
  const { activeTab = "snapshot" } = options;

  // Only include necessary API calls based on the current tab
  const preloadPromises = [
    // Always fetch hierarchy data
    fetchHierarchyOptimized().catch(() => ({
      data: [],
      fromCache: false,
      error: true,
    })),
  ];

  // Only fetch overview data when on snapshot tab
  if (activeTab === "snapshot") {
    preloadPromises.push(
      fetchOverviewDataOptimized({ activeTab }).catch(() => ({
        data: {},
        fromCache: false,
        error: true,
      }))
    );
  }

  // Add other critical data fetches here

  try {
    await Promise.allSettled(preloadPromises);
  } catch (error) {
    // Preload failures should not break the app
  }
};

// Background refresh for real-time data
export const startBackgroundRefresh = (callback, interval = 30000) => {
  const refresh = async () => {
    try {
      // Clear caches to force fresh data
      counterpartyCache.clear();
      snapshotCache.clear();
      callback?.();
    } catch (error) {
      // Background refresh failures should not break the app
    }
  };

  const intervalId = setInterval(refresh, interval);

  // Return cleanup function
  return () => clearInterval(intervalId);
};

// Export cache instances for manual control
export { apiCache, counterpartyCache, snapshotCache };
