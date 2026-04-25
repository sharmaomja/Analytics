import type { User } from "../db/queries.js";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
