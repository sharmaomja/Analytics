const tokenKey = "auth_token";

export function getStoredToken(): string | null {
  return window.localStorage.getItem(tokenKey);
}

export function storeToken(token: string): void {
  window.localStorage.setItem(tokenKey, token);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(tokenKey);
}
