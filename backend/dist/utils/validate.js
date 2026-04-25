const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
export function validateCredentials(email, password) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !emailPattern.test(normalizedEmail)) {
        return "A valid email address is required.";
    }
    if (!password || password.trim().length < 8) {
        return "Password must be at least 8 characters long.";
    }
    return null;
}
