import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  clearSession,
  getStoredUser,
  getToken,
  loginRequest,
  saveSession,
  signupRequest,
} from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Only treat the user as logged in if both a token and user info are stored
  const [user, setUser] = useState(() => (getToken() ? getStoredUser() : null));

  const login = useCallback(async (credentials) => {
    const data = await loginRequest(credentials);
    saveSession(data);
    setUser({ name: data.name, email: data.email, role: data.role || "USER" });
    return data;
  }, []);

  const signup = useCallback(async (details) => {
    const data = await signupRequest(details);
    saveSession(data);
    setUser({ name: data.name, email: data.email, role: data.role || "USER" });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const value = useMemo(
    () => ({ user, isAdmin, login, signup, logout }),
    [user, isAdmin, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
