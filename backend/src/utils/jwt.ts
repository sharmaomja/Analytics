import jwt from "jsonwebtoken";

function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is required");
  }

  return jwtSecret;
}

type AuthTokenPayload = {
  sub: string;
  email: string;
};

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as unknown as AuthTokenPayload;
}
