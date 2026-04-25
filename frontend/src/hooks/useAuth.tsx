import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types/auth";
import { fetchCurrentUser, login as loginRequest, signup as signupRequest } from "../utils/api";
import { clearStoredToken, getStoredToken, storeToken } from "../utils/auth";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const storedToken = getStoredToken();

      if (!storedToken) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const response = await fetchCurrentUser(storedToken);
        setToken(storedToken);
        setUser(response.user);
      } catch {
        clearStoredToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsBootstrapping(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginRequest(email, password);
    storeToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const signup = async (email: string, password: string) => {
    const response = await signupRequest(email, password);
    storeToken(response.token);
    setToken(response.token);
    setUser(response.user);
  };

  const logout = () => {
    clearStoredToken();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isBootstrapping,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
