import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./index.js";

export async function initializeDatabase(): Promise<void> {
  const schemaPath = fileURLToPath(new URL("../../sql/schema.sql", import.meta.url));
  const schemaSql = await readFile(schemaPath, "utf8");

  await pool.query(schemaSql);
}
