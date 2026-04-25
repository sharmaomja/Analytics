const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateCredentials(email: string, password: string): string | null {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
    return "A valid email address is required.";
  }

  if (!password || password.trim().length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}
