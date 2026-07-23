import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as api from "./api";
import { getToken, setToken, clearToken } from "./storage";

type AuthContextValue = {
  user: api.User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Au démarrage de l'app : si un token est déjà stocké, on vérifie
  // qu'il est toujours valide en récupérant le profil utilisateur.
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const { user: me } = await api.fetchMe();
        setUser(me);
      } catch {
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { token, user: loggedUser } = await api.login(email, password);
    await setToken(token);
    setUser(loggedUser);
  };

  const signup = async (name: string, email: string, password: string) => {
    const { token, user: newUser } = await api.signup(name, email, password);
    await setToken(token);
    setUser(newUser);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, signup, logout }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}
