import multer from "multer";
export function notFoundMiddleware(_req, res) {
    res.status(404).json({ error: "Route not found." });
}
export function errorMiddleware(error, _req, res, _next) {
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "CSV file must be 5MB or smaller." });
        return;
    }
    if (error.statusCode) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }
    if (error.code === "23505") {
        res.status(409).json({ error: "An account with that email already exists." });
        return;
    }
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
}
