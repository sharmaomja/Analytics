import { pool } from "../db/index.js";
import type { DatasetField, QueryConfig, QueryFilter } from "../db/queries.js";

type ValidatedQuery = {
  metric: DatasetField;
  dimension: DatasetField;
  filters: Array<{
    field: DatasetField;
    op: QueryFilter["op"];
    value: string;
  }>;
};

type QueryRow = Record<string, string | number | null>;

const allowedOperators = new Set<QueryFilter["op"]>(["=", "!=", ">", ">=", "<", "<=", "contains"]);

function buildFieldExpression(keyIndex: number, dataType: DatasetField["data_type"]): string {
  if (dataType === "numeric") {
    return `NULLIF(event_data->>$${keyIndex}, '')::numeric`;
  }

  if (dataType === "timestamp") {
    return `NULLIF(event_data->>$${keyIndex}, '')::timestamp`;
  }

  return `event_data->>$${keyIndex}`;
}

function validateQueryConfig(queryConfig: QueryConfig, datasetFields: DatasetField[]): ValidatedQuery {
  const metricName = queryConfig.metrics[0];
  const dimensionName = queryConfig.dimensions[0];

  if (!metricName) {
    const error = new Error("At least one metric is required.") as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  if (!dimensionName) {
    const error = new Error("At least one dimension is required.") as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  const fieldMap = new Map(datasetFields.map(field => [field.name, field]));
  const metric = fieldMap.get(metricName);
  const dimension = fieldMap.get(dimensionName);

  if (!metric || metric.semantic_type !== "metric") {
    const error = new Error("Selected metric is invalid.") as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  if (!dimension || !["dimension", "timestamp"].includes(dimension.semantic_type)) {
    const error = new Error("Selected dimension is invalid.") as Error & { statusCode?: number };
    error.statusCode = 400;
    throw error;
  }

  const filters = (queryConfig.filters ?? []).map(filter => {
    const field = fieldMap.get(filter.field);

    if (!field) {
      const error = new Error(`Invalid filter field: ${filter.field}`) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    if (!allowedOperators.has(filter.op)) {
      const error = new Error(`Invalid filter operator: ${filter.op}`) as Error & { statusCode?: number };
      error.statusCode = 400;
      throw error;
    }

    return {
      field,
      op: filter.op,
      value: String(filter.value ?? ""),
    };
  });

  return { metric, dimension, filters };
}

export async function runDatasetQuery(queryConfig: QueryConfig, datasetFields: DatasetField[]): Promise<QueryRow[]> {
  const { metric, dimension, filters } = validateQueryConfig(queryConfig, datasetFields);

  const parameters: Array<string> = [queryConfig.dataset_id, dimension.name, metric.name];
  const whereClauses = ["dataset_id = $1"];

  filters.forEach(filter => {
    const keyIndex = parameters.push(filter.field.name);
    const valueIndex = parameters.push(filter.value);

    if (filter.op === "contains") {
      whereClauses.push(`COALESCE(event_data->>$${keyIndex}, '') ILIKE '%' || $${valueIndex} || '%'`);
      return;
    }

    const fieldExpression = buildFieldExpression(keyIndex, filter.field.data_type);
    let valueExpression = `$${valueIndex}`;

    if (filter.field.data_type === "numeric") {
      valueExpression = `NULLIF($${valueIndex}, '')::numeric`;
    } else if (filter.field.data_type === "timestamp") {
      valueExpression = `NULLIF($${valueIndex}, '')::timestamp`;
    }

    whereClauses.push(`${fieldExpression} ${filter.op} ${valueExpression}`);
  });

  const result = await pool.query<QueryRow>(
    `SELECT
       event_data->>$2 AS dimension,
       SUM(NULLIF(event_data->>$3, '')::numeric) AS metric_value
     FROM events
     WHERE ${whereClauses.join(" AND ")}
     GROUP BY 1
     ORDER BY 1 ASC`,
    parameters,
  );

  return result.rows.map(row => ({
    dimension: row.dimension,
    [metric.name]: row.metric_value === null ? 0 : Number(row.metric_value),
  }));
}
