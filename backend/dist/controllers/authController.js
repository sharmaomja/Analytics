import bcrypt from "bcryptjs";
import { createUser, findUserByEmail, toSafeUser } from "../db/queries.js";
import { signAuthToken } from "../utils/jwt.js";
import { normalizeEmail, validateCredentials } from "../utils/validate.js";
export async function signup(req, res, next) {
    try {
        const email = normalizeEmail(String(req.body.email ?? ""));
        const password = String(req.body.password ?? "");
        const validationError = validateCredentials(email, password);
        if (validationError) {
            res.status(400).json({ error: validationError });
            return;
        }
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            res.status(409).json({ error: "An account with that email already exists." });
            return;
        }
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await createUser(email, passwordHash);
        const safeUser = toSafeUser(user);
        const token = signAuthToken({ sub: user.id, email: user.email });
        res.status(201).json({
            message: "Account created successfully.",
            token,
            user: safeUser,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function login(req, res, next) {
    try {
        const email = normalizeEmail(String(req.body.email ?? ""));
        const password = String(req.body.password ?? "");
        const validationError = validateCredentials(email, password);
        if (validationError) {
            res.status(400).json({ error: validationError });
            return;
        }
        const user = await findUserByEmail(email);
        if (!user) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            res.status(401).json({ error: "Invalid email or password." });
            return;
        }
        const safeUser = toSafeUser(user);
        const token = signAuthToken({ sub: user.id, email: user.email });
        res.status(200).json({
            message: "Login successful.",
            token,
            user: safeUser,
        });
    }
    catch (error) {
        next(error);
    }
}
export async function me(req, res) {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized." });
        return;
    }
    res.status(200).json({ user: toSafeUser(req.user) });
}
