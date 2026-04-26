import type { Pool, PoolClient } from "pg";
import { pool } from "./index.js";

type DbExecutor = Pool | PoolClient;

export type User = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export type SafeUser = Omit<User, "password_hash">;

export type Dataset = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type FileStatus = "uploaded" | "processing" | "ready" | "failed";

export type FileRecord = {
  id: string;
  dataset_id: string;
  file_name: string;
  file_type: string;
  raw_content: string;
  status: FileStatus;
  created_at: string;
};

export type SafeFileRecord = Omit<FileRecord, "raw_content">;

export type EventRow = Record<string, string>;

export type DatasetFieldDataType = "text" | "numeric" | "timestamp";

export type DatasetFieldSemanticType = "dimension" | "metric" | "timestamp";

export type DatasetField = {
  id: string;
  dataset_id: string;
  name: string;
  data_type: DatasetFieldDataType;
  semantic_type: DatasetFieldSemanticType;
  created_at: string;
};

export type DatasetFieldInput = {
  name: string;
  data_type: DatasetFieldDataType;
  semantic_type: DatasetFieldSemanticType;
};

export type QueryConfig = {
  dataset_id: string;
  metrics: string[];
  dimensions: string[];
  filters: QueryFilter[];
};

export type QueryFilter = {
  field: string;
  op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "contains";
  value: string;
};

export type SavedQuery = {
  id: string;
  dataset_id: string;
  name: string;
  query_config: QueryConfig;
  created_at: string;
};

export type Dashboard = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type ChartType = "line" | "bar";

export type WidgetPosition = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DashboardWidget = {
  id: string;
  dashboard_id: string;
  query_id: string;
  chart_type: ChartType;
  position: WidgetPosition;
  config: Record<string, unknown> | null;
  created_at: string;
};

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1",
    [email],
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    "SELECT id, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1",
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const result = await pool.query<User>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`,
    [email, passwordHash],
  );

  return result.rows[0];
}

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  };
}

export async function createDataset(userId: string, name: string, description: string | null): Promise<Dataset> {
  const result = await pool.query<Dataset>(
    `INSERT INTO datasets (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, description, created_at`,
    [userId, name, description],
  );

  return result.rows[0];
}

export async function listDatasetsByUserId(userId: string): Promise<Dataset[]> {
  const result = await pool.query<Dataset>(
    `SELECT id, user_id, name, description, created_at
     FROM datasets
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
}

export async function findDatasetByIdForUser(datasetId: string, userId: string): Promise<Dataset | null> {
  const result = await pool.query<Dataset>(
    `SELECT id, user_id, name, description, created_at
     FROM datasets
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [datasetId, userId],
  );

  return result.rows[0] ?? null;
}

export async function createFileRecord(
  datasetId: string,
  fileName: string,
  fileType: string,
  rawContent: string,
  status: FileStatus,
): Promise<FileRecord> {
  const result = await pool.query<FileRecord>(
    `INSERT INTO files (dataset_id, file_name, file_type, raw_content, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dataset_id, file_name, file_type, raw_content, status, created_at`,
    [datasetId, fileName, fileType, rawContent, status],
  );

  return result.rows[0];
}

export async function updateFileStatus(fileId: string, status: FileStatus, db: DbExecutor = pool): Promise<void> {
  await db.query("UPDATE files SET status = $2 WHERE id = $1", [fileId, status]);
}

export async function insertEventsBatch(
  datasetId: string,
  fileId: string,
  rows: EventRow[],
  db: DbExecutor = pool,
): Promise<void> {
  if (rows.length === 0) {
    return;
  }

  const values: string[] = [];
  const parameters: Array<string | EventRow> = [];

  rows.forEach((row, index) => {
    const offset = index * 3;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}::jsonb)`);
    parameters.push(datasetId, fileId, row);
  });

  await db.query(
    `INSERT INTO events (dataset_id, file_id, event_data)
     VALUES ${values.join(", ")}`,
    parameters,
  );
}

export function toSafeFileRecord(file: FileRecord): SafeFileRecord {
  return {
    id: file.id,
    dataset_id: file.dataset_id,
    file_name: file.file_name,
    file_type: file.file_type,
    status: file.status,
    created_at: file.created_at,
  };
}

export async function createDatasetFields(
  datasetId: string,
  fields: DatasetFieldInput[],
  db: DbExecutor = pool,
): Promise<void> {
  if (fields.length === 0) {
    return;
  }

  const values: string[] = [];
  const parameters: string[] = [];

  fields.forEach((field, index) => {
    const offset = index * 4;
    values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
    parameters.push(datasetId, field.name, field.data_type, field.semantic_type);
  });

  await db.query(
    `INSERT INTO dataset_fields (dataset_id, name, data_type, semantic_type)
     VALUES ${values.join(", ")}
     ON CONFLICT (dataset_id, name)
     DO UPDATE SET data_type = EXCLUDED.data_type, semantic_type = EXCLUDED.semantic_type`,
    parameters,
  );
}

export async function listDatasetFieldsByDatasetId(datasetId: string): Promise<DatasetField[]> {
  const result = await pool.query<DatasetField>(
    `SELECT id, dataset_id, name, data_type, semantic_type, created_at
     FROM dataset_fields
     WHERE dataset_id = $1
     ORDER BY name ASC`,
    [datasetId],
  );

  return result.rows;
}

export async function createSavedQuery(datasetId: string, name: string, queryConfig: QueryConfig): Promise<SavedQuery> {
  const result = await pool.query<SavedQuery>(
    `INSERT INTO queries (dataset_id, name, query_config)
     VALUES ($1, $2, $3)
     RETURNING id, dataset_id, name, query_config, created_at`,
    [datasetId, name, queryConfig],
  );

  return result.rows[0];
}

export async function findSavedQueryByIdForUser(queryId: string, userId: string): Promise<SavedQuery | null> {
  const result = await pool.query<SavedQuery>(
    `SELECT q.id, q.dataset_id, q.name, q.query_config, q.created_at
     FROM queries q
     INNER JOIN datasets d ON d.id = q.dataset_id
     WHERE q.id = $1 AND d.user_id = $2
     LIMIT 1`,
    [queryId, userId],
  );

  return result.rows[0] ?? null;
}

export async function createDashboard(userId: string, name: string): Promise<Dashboard> {
  const result = await pool.query<Dashboard>(
    `INSERT INTO dashboards (user_id, name)
     VALUES ($1, $2)
     RETURNING id, user_id, name, created_at`,
    [userId, name],
  );

  return result.rows[0];
}

export async function listDashboardsByUserId(userId: string): Promise<Dashboard[]> {
  const result = await pool.query<Dashboard>(
    `SELECT id, user_id, name, created_at
     FROM dashboards
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
}

export async function findDashboardByIdForUser(dashboardId: string, userId: string): Promise<Dashboard | null> {
  const result = await pool.query<Dashboard>(
    `SELECT id, user_id, name, created_at
     FROM dashboards
     WHERE id = $1 AND user_id = $2
     LIMIT 1`,
    [dashboardId, userId],
  );

  return result.rows[0] ?? null;
}

export async function createDashboardWidget(
  dashboardId: string,
  queryId: string,
  chartType: ChartType,
  position: WidgetPosition,
  config: Record<string, unknown> | null = null,
): Promise<DashboardWidget> {
  const result = await pool.query<DashboardWidget>(
    `INSERT INTO dashboard_widgets (dashboard_id, query_id, chart_type, position, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dashboard_id, query_id, chart_type, position, config, created_at`,
    [dashboardId, queryId, chartType, position, config],
  );

  return result.rows[0];
}

export async function listDashboardWidgetsByDashboardId(dashboardId: string): Promise<DashboardWidget[]> {
  const result = await pool.query<DashboardWidget>(
    `SELECT id, dashboard_id, query_id, chart_type, position, config, created_at
     FROM dashboard_widgets
     WHERE dashboard_id = $1
     ORDER BY created_at ASC`,
    [dashboardId],
  );

  return result.rows;
}

export async function deleteDashboardWidgetByIdForUser(widgetId: string, userId: string): Promise<DashboardWidget | null> {
  const result = await pool.query<DashboardWidget>(
    `DELETE FROM dashboard_widgets dw
     USING dashboards d
     WHERE dw.dashboard_id = d.id
       AND dw.id = $1
       AND d.user_id = $2
     RETURNING dw.id, dw.dashboard_id, dw.query_id, dw.chart_type, dw.position, dw.config, dw.created_at`,
    [widgetId, userId],
  );

  return result.rows[0] ?? null;
}
