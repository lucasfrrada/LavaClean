import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {AuthUser} from "../types/auth";
import {isTokenExpired} from "../utils/jwt";

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser, userToken: string) => void;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({children}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const storedToken = localStorage.getItem("authToken");

    if (!storedUser || !storedToken) return;

    if (isTokenExpired(storedToken)) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
      return;
    }

    try {
      setUser(JSON.parse(storedUser) as AuthUser);
      setToken(storedToken);
    } catch {
      localStorage.removeItem("authUser");
      localStorage.removeItem("authToken");
    }
  }, []);

  const login = (userData: AuthUser, userToken: string) => {
    setUser(userData);
    setToken(userToken);

    localStorage.setItem("authUser", JSON.stringify(userData));
    localStorage.setItem("authToken", userToken);
  };

  const updateUser = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("authUser", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
  };

  const isAuthenticated = Boolean(token) && !isTokenExpired(token);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }

  return context;
}
