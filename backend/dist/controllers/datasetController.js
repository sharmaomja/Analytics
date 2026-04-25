import { createDataset, listDatasetsByUserId } from "../db/queries.js";
export async function createDatasetHandler(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        const name = String(req.body.name ?? "").trim();
        const descriptionValue = String(req.body.description ?? "").trim();
        const description = descriptionValue ? descriptionValue : null;
        if (!name) {
            res.status(400).json({ error: "Dataset name is required." });
            return;
        }
        const dataset = await createDataset(req.user.id, name, description);
        res.status(201).json({
            message: "Dataset created successfully.",
            dataset,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function listDatasetsHandler(req, res, next) {
    try {
        if (!req.user) {
            res.status(401).json({ error: "Unauthorized." });
            return;
        }
        const datasets = await listDatasetsByUserId(req.user.id);
        res.status(200).json({ datasets });
    }
    catch (error) {
        next(error);
    }
}
