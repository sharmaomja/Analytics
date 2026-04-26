export type Dataset = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type FileRecord = {
  id: string;
  dataset_id: string;
  file_name: string;
  file_type: string;
  status: "uploaded" | "processing" | "ready" | "failed";
  created_at: string;
};

export type CreateDatasetResponse = {
  message: string;
  dataset: Dataset;
};

export type ListDatasetsResponse = {
  datasets: Dataset[];
};

export type UploadResponse = {
  message: string;
  dataset: Dataset;
  file: FileRecord;
  insertedCount: number;
};

export type DatasetField = {
  id: string;
  dataset_id: string;
  name: string;
  data_type: "text" | "numeric" | "timestamp";
  semantic_type: "dimension" | "metric" | "timestamp";
  created_at: string;
};

export type QueryFilter = {
  field: string;
  op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
  value: string;
};

export type QueryConfig = {
  dataset_id: string;
  metrics: string[];
  dimensions: string[];
  filters: QueryFilter[];
};

export type DatasetFieldsResponse = {
  fields: DatasetField[];
};

export type QueryResultRow = {
  dimension: string;
  [metric: string]: string | number;
};

export type RunQueryResponse = {
  query: {
    dataset_id: string;
    metric: string | null;
    dimension: string | null;
  };
  rows: QueryResultRow[];
};

export type SaveQueryResponse = {
  message: string;
  query: {
    id: string;
    dataset_id: string;
    name: string;
    query_config: QueryConfig;
    created_at: string;
  };
};

export type ChartType = "line" | "bar";

export type WidgetPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Dashboard = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type DashboardWidget = {
  id: string;
  dashboard_id: string;
  query_id: string;
  query_name: string | null;
  chart_type: ChartType;
  position: WidgetPosition;
  config: Record<string, unknown> | null;
  query_config?: QueryConfig;
  metric: string | null;
  rows: QueryResultRow[];
  created_at: string;
};

export type CreateDashboardResponse = {
  message: string;
  dashboard: Dashboard;
};

export type ListDashboardsResponse = {
  dashboards: Dashboard[];
};

export type DashboardDetailResponse = {
  dashboard: Dashboard;
  widgets: DashboardWidget[];
};

export type CreateWidgetResponse = {
  message: string;
  widget: {
    id: string;
    dashboard_id: string;
    query_id: string;
    chart_type: ChartType;
    position: WidgetPosition;
    config: Record<string, unknown> | null;
    created_at: string;
  };
};

export type DeleteWidgetResponse = {
  message: string;
  widget: {
    id: string;
  };
};
