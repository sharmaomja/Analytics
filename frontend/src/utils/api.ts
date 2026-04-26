import type { AuthResponse, MeResponse } from "../types/auth";
import type {
  ChartType,
  CreateDashboardResponse,
  CreateDatasetResponse,
  CreateWidgetResponse,
  DashboardDetailResponse,
  DeleteWidgetResponse,
  DatasetFieldsResponse,
  ListDashboardsResponse,
  ListDatasetsResponse,
  QueryConfig,
  RunQueryResponse,
  SaveQueryResponse,
  UploadResponse,
} from "../types/data";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  isFormData?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.isFormData
      ? (options.body as FormData | undefined)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(data.error ?? "Request failed.");
  }

  return data;
}

export function signup(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: { email, password },
  });
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function fetchCurrentUser(token: string): Promise<MeResponse> {
  return request<MeResponse>("/auth/me", {
    token,
  });
}

export function createDataset(token: string, name: string, description: string): Promise<CreateDatasetResponse> {
  return request<CreateDatasetResponse>("/datasets", {
    method: "POST",
    token,
    body: { name, description },
  });
}

export function createDashboard(token: string, name: string): Promise<CreateDashboardResponse> {
  return request<CreateDashboardResponse>("/dashboards", {
    method: "POST",
    token,
    body: { name },
  });
}

export function fetchDashboards(token: string): Promise<ListDashboardsResponse> {
  return request<ListDashboardsResponse>("/dashboards", {
    token,
  });
}

export function fetchDashboard(token: string, dashboardId: string): Promise<DashboardDetailResponse> {
  return request<DashboardDetailResponse>(`/dashboards/${dashboardId}`, {
    token,
  });
}

export function fetchDatasets(token: string): Promise<ListDatasetsResponse> {
  return request<ListDatasetsResponse>("/datasets", {
    token,
  });
}

export function uploadCsvFile(token: string, datasetId: string, file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("datasetId", datasetId);
  formData.append("file", file);

  return request<UploadResponse>("/upload", {
    method: "POST",
    token,
    body: formData,
    isFormData: true,
  });
}

export function fetchDatasetFields(token: string, datasetId: string): Promise<DatasetFieldsResponse> {
  return request<DatasetFieldsResponse>(`/query/fields/${datasetId}`, {
    token,
  });
}

export function runQuery(token: string, queryConfig: QueryConfig): Promise<RunQueryResponse> {
  return request<RunQueryResponse>("/query/run", {
    method: "POST",
    token,
    body: queryConfig,
  });
}

export function saveQuery(token: string, name: string, queryConfig: QueryConfig): Promise<SaveQueryResponse> {
  return request<SaveQueryResponse>("/query/save", {
    method: "POST",
    token,
    body: {
      name,
      query_config: queryConfig,
    },
  });
}

export function createWidget(
  token: string,
  input: {
    dashboard_id: string;
    query_id: string;
    chart_type: ChartType;
    position: { x: number; y: number; w: number; h: number };
  },
): Promise<CreateWidgetResponse> {
  return request<CreateWidgetResponse>("/widgets", {
    method: "POST",
    token,
    body: input,
  });
}

export function deleteWidget(token: string, widgetId: string): Promise<DeleteWidgetResponse> {
  return request<DeleteWidgetResponse>(`/widgets/${widgetId}`, {
    method: "DELETE",
    token,
  });
}
