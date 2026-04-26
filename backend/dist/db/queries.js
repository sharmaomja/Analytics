import { pool } from "./index.js";
export async function findUserByEmail(email) {
    const result = await pool.query("SELECT id, email, password_hash, created_at FROM users WHERE email = $1 LIMIT 1", [email]);
    return result.rows[0] ?? null;
}
export async function findUserById(id) {
    const result = await pool.query("SELECT id, email, password_hash, created_at FROM users WHERE id = $1 LIMIT 1", [id]);
    return result.rows[0] ?? null;
}
export async function createUser(email, passwordHash) {
    const result = await pool.query(`INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, password_hash, created_at`, [email, passwordHash]);
    return result.rows[0];
}
export function toSafeUser(user) {
    return {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
    };
}
export async function createDataset(userId, name, description) {
    const result = await pool.query(`INSERT INTO datasets (user_id, name, description)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, name, description, created_at`, [userId, name, description]);
    return result.rows[0];
}
export async function listDatasetsByUserId(userId) {
    const result = await pool.query(`SELECT id, user_id, name, description, created_at
     FROM datasets
     WHERE user_id = $1
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
export async function findDatasetByIdForUser(datasetId, userId) {
    const result = await pool.query(`SELECT id, user_id, name, description, created_at
     FROM datasets
     WHERE id = $1 AND user_id = $2
     LIMIT 1`, [datasetId, userId]);
    return result.rows[0] ?? null;
}
export async function createFileRecord(datasetId, fileName, fileType, rawContent, status) {
    const result = await pool.query(`INSERT INTO files (dataset_id, file_name, file_type, raw_content, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dataset_id, file_name, file_type, raw_content, status, created_at`, [datasetId, fileName, fileType, rawContent, status]);
    return result.rows[0];
}
export async function updateFileStatus(fileId, status, db = pool) {
    await db.query("UPDATE files SET status = $2 WHERE id = $1", [fileId, status]);
}
export async function insertEventsBatch(datasetId, fileId, rows, db = pool) {
    if (rows.length === 0) {
        return;
    }
    const values = [];
    const parameters = [];
    rows.forEach((row, index) => {
        const offset = index * 3;
        values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}::jsonb)`);
        parameters.push(datasetId, fileId, row);
    });
    await db.query(`INSERT INTO events (dataset_id, file_id, event_data)
     VALUES ${values.join(", ")}`, parameters);
}
export function toSafeFileRecord(file) {
    return {
        id: file.id,
        dataset_id: file.dataset_id,
        file_name: file.file_name,
        file_type: file.file_type,
        status: file.status,
        created_at: file.created_at,
    };
}
export async function createDatasetFields(datasetId, fields, db = pool) {
    if (fields.length === 0) {
        return;
    }
    const values = [];
    const parameters = [];
    fields.forEach((field, index) => {
        const offset = index * 4;
        values.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
        parameters.push(datasetId, field.name, field.data_type, field.semantic_type);
    });
    await db.query(`INSERT INTO dataset_fields (dataset_id, name, data_type, semantic_type)
     VALUES ${values.join(", ")}
     ON CONFLICT (dataset_id, name)
     DO UPDATE SET data_type = EXCLUDED.data_type, semantic_type = EXCLUDED.semantic_type`, parameters);
}
export async function listDatasetFieldsByDatasetId(datasetId) {
    const result = await pool.query(`SELECT id, dataset_id, name, data_type, semantic_type, created_at
     FROM dataset_fields
     WHERE dataset_id = $1
     ORDER BY name ASC`, [datasetId]);
    return result.rows;
}
export async function createSavedQuery(datasetId, name, queryConfig) {
    const result = await pool.query(`INSERT INTO queries (dataset_id, name, query_config)
     VALUES ($1, $2, $3)
     RETURNING id, dataset_id, name, query_config, created_at`, [datasetId, name, queryConfig]);
    return result.rows[0];
}
export async function findSavedQueryByIdForUser(queryId, userId) {
    const result = await pool.query(`SELECT q.id, q.dataset_id, q.name, q.query_config, q.created_at
     FROM queries q
     INNER JOIN datasets d ON d.id = q.dataset_id
     WHERE q.id = $1 AND d.user_id = $2
     LIMIT 1`, [queryId, userId]);
    return result.rows[0] ?? null;
}
export async function createDashboard(userId, name) {
    const result = await pool.query(`INSERT INTO dashboards (user_id, name)
     VALUES ($1, $2)
     RETURNING id, user_id, name, created_at`, [userId, name]);
    return result.rows[0];
}
export async function listDashboardsByUserId(userId) {
    const result = await pool.query(`SELECT id, user_id, name, created_at
     FROM dashboards
     WHERE user_id = $1
     ORDER BY created_at DESC`, [userId]);
    return result.rows;
}
export async function findDashboardByIdForUser(dashboardId, userId) {
    const result = await pool.query(`SELECT id, user_id, name, created_at
     FROM dashboards
     WHERE id = $1 AND user_id = $2
     LIMIT 1`, [dashboardId, userId]);
    return result.rows[0] ?? null;
}
export async function createDashboardWidget(dashboardId, queryId, chartType, position, config = null) {
    const result = await pool.query(`INSERT INTO dashboard_widgets (dashboard_id, query_id, chart_type, position, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, dashboard_id, query_id, chart_type, position, config, created_at`, [dashboardId, queryId, chartType, position, config]);
    return result.rows[0];
}
export async function listDashboardWidgetsByDashboardId(dashboardId) {
    const result = await pool.query(`SELECT id, dashboard_id, query_id, chart_type, position, config, created_at
     FROM dashboard_widgets
     WHERE dashboard_id = $1
     ORDER BY created_at ASC`, [dashboardId]);
    return result.rows;
}
export async function deleteDashboardWidgetByIdForUser(widgetId, userId) {
    const result = await pool.query(`DELETE FROM dashboard_widgets dw
     USING dashboards d
     WHERE dw.dashboard_id = d.id
       AND dw.id = $1
       AND d.user_id = $2
     RETURNING dw.id, dw.dashboard_id, dw.query_id, dw.chart_type, dw.position, dw.config, dw.created_at`, [widgetId, userId]);
    return result.rows[0] ?? null;
}
