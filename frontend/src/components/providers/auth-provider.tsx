"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { browserApi } from "@/lib/browser-api";
import type { AccountProfile, AuthResponse, AuthUser } from "@/lib/types";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  profile: AccountProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: { email: string; password: string }) => Promise<AuthResponse>;
  signup: (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResponse>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "littlegenius.auth.token";
const USER_KEY = "littlegenius.auth.user";
const emptySubscribe = () => () => undefined;

type SetState<T> = Dispatch<SetStateAction<T>>;

function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const existingUser = window.localStorage.getItem(USER_KEY);
  if (!existingUser || existingUser === "undefined") {
    return null;
  }

  try {
    return JSON.parse(existingUser) as AuthUser;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
}

function persistStoredSession(token: string, user: AuthUser) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function syncSessionState({
  sessionToken,
  fallbackUser,
  setLoading,
  setToken,
  setUser,
  setProfile,
}: {
  sessionToken: string;
  fallbackUser?: AuthUser | null;
  setLoading: SetState<boolean>;
  setToken: SetState<string | null>;
  setUser: SetState<AuthUser | null>;
  setProfile: SetState<AccountProfile | null>;
}) {
  setLoading(true);
  setToken(sessionToken);
  if (fallbackUser) {
    setUser(fallbackUser);
  }

  try {
    const result = await browserApi.getMe(sessionToken);
    setProfile(result);
    setUser(result.user);
    persistStoredSession(sessionToken, result.user);
    return result;
  } catch (error) {
    clearStoredSession();
    setToken(null);
    setUser(null);
    setProfile(null);
    throw error;
  } finally {
    setLoading(false);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const storedToken = isClient ? window.localStorage.getItem(TOKEN_KEY) : null;
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const loading = !isClient || (Boolean(storedToken) && !token && !user) || syncing;

  useEffect(() => {
    if (!storedToken || token === storedToken) {
      return;
    }

    const storedUser = readStoredUser();
    void syncSessionState({
      sessionToken: storedToken,
      fallbackUser: storedUser,
      setLoading: setSyncing,
      setToken,
      setUser,
      setProfile,
    }).catch(() => undefined);
  }, [storedToken, token]);

  const persistAuth = (result: AuthResponse) => {
    setToken(result.token);
    setUser(result.user);
    persistStoredSession(result.token, result.user);
  };

  const refreshProfile = async () => {
    if (!token) {
      return;
    }
    await syncSessionState({
      sessionToken: token,
      fallbackUser: user,
      setLoading: setSyncing,
      setToken,
      setUser,
      setProfile,
    });
  };

  const login = async (payload: { email: string; password: string }) => {
    const result = await browserApi.login(payload);
    persistAuth(result);
    await syncSessionState({
      sessionToken: result.token,
      fallbackUser: result.user,
      setLoading: setSyncing,
      setToken,
      setUser,
      setProfile,
    });
    return result;
  };

  const signup = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const result = await browserApi.signup(payload);
    persistAuth(result);
    await syncSessionState({
      sessionToken: result.token,
      fallbackUser: result.user,
      setLoading: setSyncing,
      setToken,
      setUser,
      setProfile,
    });
    return result;
  };

  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
    setProfile(null);
    setSyncing(false);
  };

  const value: AuthContextValue = {
    token,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === "Admin",
    login,
    signup,
    refreshProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
