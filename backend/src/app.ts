import express from "express";
import cors from "cors";
import { authRouter } from "./routes/authRoutes.js";
import { datasetRouter } from "./routes/datasetRoutes.js";
import { uploadRouter } from "./routes/uploadRoutes.js";
import { errorMiddleware, notFoundMiddleware } from "./middleware/errorMiddleware.js";

export const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/datasets", datasetRouter);
app.use("/upload", uploadRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
