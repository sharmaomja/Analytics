import { parse } from "csv-parse/sync";
import { pool } from "../db/index.js";
import { insertEventsBatch, updateFileStatus, type EventRow } from "../db/queries.js";

type ProcessCsvInput = {
  datasetId: string;
  fileId: string;
  rawContent: string;
};

const batchSize = 250;

function isEmptyRow(row: EventRow): boolean {
  return Object.values(row).every(value => String(value ?? "").trim() === "");
}

export async function processUploadedCsv({ datasetId, fileId, rawContent }: ProcessCsvInput): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await updateFileStatus(fileId, "processing", client);

    const rows = parse(rawContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as EventRow[];

    const validRows = rows.filter(row => !isEmptyRow(row));

    if (validRows.length === 0) {
      const error = new Error("CSV file does not contain any data rows.") as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    for (let index = 0; index < validRows.length; index += batchSize) {
      const batch = validRows.slice(index, index + batchSize);
      await insertEventsBatch(datasetId, fileId, batch, client);
    }

    await updateFileStatus(fileId, "ready", client);
    await client.query("COMMIT");

    return validRows.length;
  } catch (error) {
    await client.query("ROLLBACK");
    await updateFileStatus(fileId, "failed");
    throw error;
  } finally {
    client.release();
  }
}
