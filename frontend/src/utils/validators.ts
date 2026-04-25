const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthForm(email: string, password: string): string | null {
  if (!email.trim() || !emailPattern.test(email.trim().toLowerCase())) {
    return "Enter a valid email address.";
  }

  if (password.trim().length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}
