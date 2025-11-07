import axios, { AxiosResponse, AxiosError } from "axios";

// === Configuration ===
const API_BASE = "http://10.20.0.4:8089/api" as const;

// === Axios Interceptors ===
axios.interceptors.request.use(
  (config) => config,
  (error: AxiosError) => {
    if (error.code === "ECONNABORTED" || error.message === "Network Error") {
      return Promise.reject({
        ...error,
        message: "Service temporarily unavailable",
        isNetworkError: true,
      } as NetworkError);
    }
    return Promise.reject(error);
  }
);

// === Types & Interfaces ===
interface NetworkError extends AxiosError {
  isNetworkError?: boolean;
}

interface HierarchyNode {
  id?: string;
  key: string;
  nodeKey?: string;
  name: string;
  amount: number;
  parentKey: string | null;
  type: string;
  level?: number;
  currency?: string;
  status?: string;
  children?: HierarchyNode[];
}

interface OverviewData {
  [key: string]: any;
}

interface CounterpartyNode {
  [key: string]: any;
}

interface ApiResponse<T = any> {
  data: T;
  fromCache?: boolean;
  error?: boolean;
}

// === Retry Manager ===
class RetryManager {
  private retryMap = new Map<string, { count: number; nextRetryTime: number }>();
  private maxRetries: number;

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
  }

  shouldRetry(endpoint: string): boolean {
    const retryInfo = this.retryMap.get(endpoint) || { count: 0, nextRetryTime: 0 };
    const now = Date.now();

    if (retryInfo.count >= this.maxRetries) {
      console.log(`[RetryManager] Max retries (${this.maxRetries}) reached for ${endpoint}.`);
      setTimeout(() => this.retryMap.delete(endpoint), 120000);
      return false;
    }

    if (now < retryInfo.nextRetryTime) {
      return false;
    }

    const backoff = Math.min(30000, Math.pow(2, retryInfo.count) * 1000 + Math.random() * 1000);
    const nextRetryTime = now + backoff;

    this.retryMap.set(endpoint, { count: retryInfo.count + 1, nextRetryTime });
    console.log(`[RetryManager] Retry ${retryInfo.count + 1}/${this.maxRetries} for ${endpoint}.`);
    return true;
  }

  reset(endpoint: string): void {
    this.retryMap.delete(endpoint);
  }
}

const retryManager = new RetryManager(3);

// === Cache Manager ===
class ApiCache<T = any> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private ttl: number;

  constructor(ttl = 5 * 60 * 1000) {
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

const apiCache = new ApiCache<HierarchyNode[]>();
const counterpartyCache = new ApiCache<CounterpartyNode[]>(2 * 60 * 1000);
const snapshotCache = new ApiCache<OverviewData>(1 * 60 * 1000);

// === API Endpoints ===
export const overviewData = (): Promise<AxiosResponse<OverviewData[]>> =>
  axios.get(`${API_BASE}/overview`);

export const getOverviewData = async (
  setLoadingState?: (loading: boolean) => void
): Promise<OverviewData> => {
  try {
    if (setLoadingState) setLoadingState(true);
    const response = await overviewData();
    return Array.isArray(response.data) && response.data.length > 0
      ? response.data[0]
      : response.data;
  } catch (error) {
    throw error;
  }
};

export const getInvestmentSuggestions = async (): Promise<any> => {
  const response = await axios.get(`${API_BASE}/ai-predictions`);
  return response.data;
};

export const overviewDataSSE = (
  onMessage: (data: any) => void,
  onHeartbeat?: (data: any) => void,
  onError?: (error: Event | Error) => void
): EventSource | null => {
  try {
    const eventSource = new EventSource(`${API_BASE}/flow_chart/sse`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        onError?.(err as Error);
      }
    };

    eventSource.addEventListener("overview", (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data);
        onMessage(rawData.data || rawData);
      } catch (err) {
        onError?.(err as Error);
      }
    });

    eventSource.addEventListener("heartbeat", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        onHeartbeat?.(data);
      } catch (err) {
        console.warn("Heartbeat parse error:", err);
      }
    });

    eventSource.addEventListener("notifications", (event: MessageEvent) => {
      try {
        console.log("Notifications:", JSON.parse(event.data));
      } catch (err) {
        console.warn("Notifications parse error:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE Error:", err);
      onError?.(err);
    };

    return eventSource;
  } catch (error) {
    console.error("Failed to create SSE:", error);
    onError?.(error as Error);
    return null;
  }
};

// === Funds Hierarchy ===
export const fetchHierarchy = (): Promise<AxiosResponse<HierarchyNode[]>> =>
  axios.get(`${API_BASE}/funds/getAll`);

export const createNode = async (payload: {
  nodeKey: string;
  name: string;
  amount: number;
  parentKey?: string | null;
  type?: string | null;
}): Promise<AxiosResponse> => {
  return axios.post(`${API_BASE}/funds/create`, payload);
};

export const updateNode = (node: HierarchyNode): Promise<AxiosResponse> =>
  axios.put(`${API_BASE}/funds/nodes/${node.key}`, node);

export const deleteNode = (key: string): Promise<AxiosResponse> =>
  axios.delete(`${API_BASE}/funds/delete/${key}`);

// === Counterparty ===
export const counterpartyData = (): Promise<AxiosResponse<CounterpartyNode[]>> =>
  axios.get(`${API_BASE}/counterparty-positions`);

export const counterpartyActivate = async (counterpartyName: string): Promise<AxiosResponse> => {
  const response = await axios.post(
    `${API_BASE}/counterparty/activate?counterpartyName=${counterpartyName}`
  );
  counterpartyCache.clear();
  return response;
};

export const counterpartyDeactivate = async (counterpartyName: string): Promise<AxiosResponse> => {
  const response = await axios.post(
    `${API_BASE}/counterparty/deactivate?counterpartyName=${counterpartyName}`
  );
  counterpartyCache.clear();
  return response;
};

// === File Upload ===
export const uploadFile = async (file: File): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return axios.post(`${API_BASE}/upload-file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// === Chat & Rules ===
export const chatResponse = async (query: string): Promise<AxiosResponse> => {
  return axios.post(
    `${API_BASE}/send-query`,
    { query },
    {
      timeout: 600000,
      headers: { "Content-Type": "application/json" },
    }
  );
};

export const fetchInitialRules = async (sessionId = "mysession1"): Promise<AxiosResponse> => {
  return axios.post(
    `${API_BASE}/chat`,
    { message: "show rules", session_id: sessionId },
    { timeout: 1200000, headers: { "Content-Type": "application/json" } }
  );
};

export const rulesResponse = async (
  message: string,
  sessionId = "mysession1"
): Promise<AxiosResponse> => {
  return axios.post(
    `${API_BASE}/chat`,
    { message, session_id: sessionId },
    { timeout: 1200000, headers: { "Content-Type": "application/json" } }
  );
};

// === Optimized & Cached Endpoints ===
const processNode = (node: any): HierarchyNode => ({
  ...node,
  id: node.id || undefined,
  key: node.key || node.nodeKey || `node-${Date.now()}`,
  nodeKey: node.nodeKey || node.key || `node-${Date.now()}`,
  name: node.name || "",
  amount: typeof node.amount === "number" ? node.amount : 0,
  parentKey: node.parentKey || null,
  type: node.type || "pool",
  level: node.level || 1,
  currency: node.currency || "USD",
  status: node.status || "active",
  children: Array.isArray(node.children)
    ? node.children.map((child: any) =>
        processNode({ ...child, level: (node.level || 1) + 1 })
      )
    : [],
});

export const fetchHierarchyOptimized = async (): Promise<ApiResponse<HierarchyNode[]>> => {
  const cacheKey = "hierarchy";
  const endpoint = "hierarchy";
  const cached = apiCache.get(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  try {
    const response = await fetchHierarchy();
    retryManager.reset(endpoint);

    const raw: any = response.data;
    const dataArray: any[] = Array.isArray(raw) ? raw : raw?.nodes || [];

    const processedData = dataArray.map(processNode);
    apiCache.set(cacheKey, processedData);
    return { data: processedData, fromCache: false };
  } catch (error: any) {
    if (
      (error.isNetworkError || error.message === "Network Error") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[Retry] Will retry ${endpoint}`);
    }
    return { data: [], fromCache: false, error: true };
  }
};

export const fetchCounterpartyDataOptimized = async (
  companies: string[] = ["default"]
): Promise<ApiResponse<CounterpartyNode[]>> => {
  const cacheKey = `counterparty_${companies.sort().join("_")}`;
  const endpoint = "counterparty";
  const cached = counterpartyCache.get(cacheKey);
  if (cached) return { data: cached, fromCache: true };

  try {
    const response = await counterpartyData();
    retryManager.reset(endpoint);
    const raw: any = response.data;
    const data = raw?.nodes || raw || [];
    counterpartyCache.set(cacheKey, data);
    return { data, fromCache: false };
  } catch (error: any) {
    if (
      (error.isNetworkError || error.message === "Network Error") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[Retry] Will retry ${endpoint}`);
    }
    return { data: [], fromCache: false, error: true };
  }
};

export const fetchOverviewDataOptimized = async (
  options: {
    activeTab?: string;
    skipFetch?: boolean;
    forceRefresh?: boolean;
    skipSetupSSE?: boolean;
  } = {}
): Promise<ApiResponse<OverviewData>> => {
  const { activeTab = "snapshot", skipFetch = false, forceRefresh = false } = options;
  const cacheKey = "overview_snapshot";
  const endpoint = "overview";

  if (activeTab !== "snapshot" && !forceRefresh) {
    const cached = snapshotCache.get(cacheKey);
    if (cached) return { data: cached, fromCache: true };
    if (skipFetch) return { data: {}, fromCache: false };
  }

  const cached = snapshotCache.get(cacheKey);
  if (cached && !forceRefresh) {
    await new Promise((r) => setTimeout(r, 500));
    return { data: cached, fromCache: true };
  }

  try {
    await new Promise((r) => setTimeout(r, 300));
    const response = await overviewData();
    retryManager.reset(endpoint);

    const data = response.data;
    snapshotCache.set(cacheKey, data);
    await new Promise((r) => setTimeout(r, 500));
    return { data, fromCache: false };
  } catch (error: any) {
    await new Promise((r) => setTimeout(r, 1000));
    if (
      (error.isNetworkError || error.message === "Network Error") &&
      retryManager.shouldRetry(endpoint)
    ) {
      console.log(`[Retry] Will retry ${endpoint}`);
    }
    return { data: {}, fromCache: false, error: true };
  }
};

// === Preload & Background Refresh ===
export const preloadDashboardData = async (options: { activeTab?: string } = {}): Promise<void> => {
  const { activeTab = "snapshot" } = options;
  const promises: Promise<unknown>[] = [
    fetchHierarchyOptimized().catch(() => ({ data: [], error: true })),
  ];
  if (activeTab === "snapshot") {
    promises.push(
      fetchOverviewDataOptimized({ activeTab }).catch(() => ({ data: {}, error: true }))
    );
  }
  await Promise.allSettled(promises);
};

export const startBackgroundRefresh = (
  callback?: () => void,
  interval = 30000
): () => void => {
  const refresh = async () => {
    counterpartyCache.clear();
    snapshotCache.clear();
    callback?.();
  };
  const id = setInterval(refresh, interval);
  return () => clearInterval(id);
};

// === Export Caches ===
export { apiCache, counterpartyCache, snapshotCache };