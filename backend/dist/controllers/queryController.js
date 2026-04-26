import { createSavedQuery, findDatasetByIdForUser, listDatasetFieldsByDatasetId } from "../db/queries.js";
import { runDatasetQuery } from "../services/queryService.js";
function normalizeQueryConfig(body) {
    const dataset_id = String(body.dataset_id ?? "").trim();
    const metrics = Array.isArray(body.metrics) ? body.metrics.map((value) => String(value).trim()).filter(Boolean) : [];
    const dimensions = Array.isArray(body.dimensions) ? body.dimensions.map((value) => String(value).trim()).filter(Boolean) : [];
    const filters = Array.isArray(body.filters)
        ? body.filters.map((filterValue) => {
            const normalized = filterValue;
            return {
                field: String(normalized.field ?? "").trim(),
                op: String(normalized.op ?? "").trim(),
                value: String(normalized.value ?? "").trim(),
            };
        }).filter((filter) => Boolean(filter.field && filter.op))
        : [];
    return {
        dataset_id,
        metrics,
        dimensions,
        filters,
    };
}
export async function listDatasetFieldsHandler(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        const datasetId = String(req.params.datasetId ?? "").trim();
        if (!datasetId) {
            res.status(400).json({ error: "datasetId is required." });
            return;
        }
        const dataset = await findDatasetByIdForUser(datasetId, req.user.id);
        if (!dataset) {
            res.status(404).json({ error: "Dataset not found." });
            return;
        }
        const fields = await listDatasetFieldsByDatasetId(dataset.id);
        res.status(200).json({ fields });
    }
    catch (error) {
        next(error);
    }
}
export async function runQueryHandler(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        const queryConfig = normalizeQueryConfig(req.body);
        if (!queryConfig.dataset_id) {
            res.status(400).json({ error: "dataset_id is required." });
            return;
        }
        const dataset = await findDatasetByIdForUser(queryConfig.dataset_id, req.user.id);
        if (!dataset) {
            res.status(404).json({ error: "Dataset not found." });
            return;
        }
        const fields = await listDatasetFieldsByDatasetId(dataset.id);
        const rows = await runDatasetQuery(queryConfig, fields);
        res.status(200).json({
            query: {
                dataset_id: dataset.id,
                metric: queryConfig.metrics[0] ?? null,
                dimension: queryConfig.dimensions[0] ?? null,
            },
            rows,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function saveQueryHandler(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        const name = String(req.body.name ?? "").trim();
        const queryConfig = normalizeQueryConfig(req.body.query_config ?? req.body);
        if (!name) {
            res.status(400).json({ error: "Query name is required." });
            return;
        }
        if (!queryConfig.dataset_id) {
            res.status(400).json({ error: "dataset_id is required." });
            return;
        }
        const dataset = await findDatasetByIdForUser(queryConfig.dataset_id, req.user.id);
        if (!dataset) {
            res.status(404).json({ error: "Dataset not found." });
            return;
        }
        const fields = await listDatasetFieldsByDatasetId(dataset.id);
        await runDatasetQuery(queryConfig, fields);
        const savedQuery = await createSavedQuery(dataset.id, name, queryConfig);
        res.status(201).json({
            message: "Query saved successfully.",
            query: savedQuery,
        });
    }
    catch (error) {
        next(error);
    }
}
