import { parse } from "csv-parse/sync";
import { pool } from "../db/index.js";
import { createDatasetFields, insertEventsBatch, updateFileStatus, type DatasetFieldInput, type EventRow } from "../db/queries.js";

type ProcessCsvInput = {
  datasetId: string;
  fileId: string;
  rawContent: string;
};

const batchSize = 250;

const numericPattern = /^-?\d+(\.\d+)?$/;

function isNumericValue(value: string): boolean {
  return numericPattern.test(value.trim());
}

function isTimestampValue(value: string): boolean {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  const timestamp = Date.parse(normalized);
  return !Number.isNaN(timestamp);
}

function inferDatasetFields(rows: EventRow[]): DatasetFieldInput[] {
  const fieldNames = Object.keys(rows[0] ?? {});

  return fieldNames.map(name => {
    const values = rows
      .map(row => String(row[name] ?? "").trim())
      .filter(value => value !== "");

    const isNumeric = values.length > 0 && values.every(isNumericValue);
    const isTimestamp = values.length > 0 && values.every(isTimestampValue);

    if (isNumeric) {
      return {
        name,
        data_type: "numeric",
        semantic_type: "metric",
      };
    }

    if (isTimestamp) {
      return {
        name,
        data_type: "timestamp",
        semantic_type: "timestamp",
      };
    }

    return {
      name,
      data_type: "text",
      semantic_type: "dimension",
    };
  });
}

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

    const datasetFields = inferDatasetFields(validRows);
    await createDatasetFields(datasetId, datasetFields, client);

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
