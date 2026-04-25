import { app } from "./app.js";
import { initializeDatabase } from "./db/init.js";
const port = Number(process.env.PORT ?? 4000);
function validateRequiredEnv() {
    const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
}
async function startServer() {
    validateRequiredEnv();
    await initializeDatabase();
    app.listen(port, () => {
        console.log(`Auth API listening on http://localhost:${port}`);
    });
}
startServer().catch(error => {
    console.error("Failed to start API server.", error);
    process.exit(1);
});
