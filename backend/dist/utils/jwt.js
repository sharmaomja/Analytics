import jwt from "jsonwebtoken";
function getJwtSecret() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is required");
    }
    return jwtSecret;
}
export function signAuthToken(payload) {
    return jwt.sign(payload, getJwtSecret(), {
        expiresIn: "7d",
    });
}
export function verifyAuthToken(token) {
    return jwt.verify(token, getJwtSecret());
}
