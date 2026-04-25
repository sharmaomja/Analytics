import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config({
    path: new URL("../../.env", import.meta.url),
});
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}
export const pool = new Pool({
    connectionString: databaseUrl,
});
