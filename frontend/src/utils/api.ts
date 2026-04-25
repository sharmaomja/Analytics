import type { AuthResponse, MeResponse } from "../types/auth";
import type { CreateDatasetResponse, ListDatasetsResponse, UploadResponse } from "../types/data";

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
