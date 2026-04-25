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
