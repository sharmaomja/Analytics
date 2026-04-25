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
