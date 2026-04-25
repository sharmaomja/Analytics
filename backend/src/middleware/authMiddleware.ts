import type { NextFunction, Request, Response } from "express";
import { findUserById } from "../db/queries.js";
import { verifyAuthToken } from "../utils/jwt.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Authorization token is required." });
      return;
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = verifyAuthToken(token);
    const user = await findUserById(payload.sub);

    if (!user) {
      res.status(401).json({ error: "Invalid authentication token." });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid authentication token." });
  }
}
