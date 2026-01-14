import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { diffsome } from "@/core/lib/diffsome";

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  getGoogleAuthUrl: () => Promise<{ success: boolean; authUrl?: string; message?: string }>;
  handleGoogleCallback: (code: string) => Promise<{ success: boolean; message: string }>;
  handleSocialCallback: (token: string, user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "auth_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        setUser(user);
        setToken(token);
        diffsome.auth.setToken(token);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await diffsome.auth.login({ email, password });

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: response.user, token: response.token })
      );
      return { success: true, message: "로그인에 성공했습니다." };
    } catch (error: any) {
      return { success: false, message: error.message || "로그인에 실패했습니다." };
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await diffsome.auth.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: response.user, token: response.token })
      );
      return { success: true, message: "회원가입에 성공했습니다." };
    } catch (error: any) {
      return { success: false, message: error.message || "회원가입에 실패했습니다." };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await diffsome.auth.logout();
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);
      setToken(null);
      diffsome.auth.setToken(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const getGoogleAuthUrl = async () => {
    try {
      const response = await diffsome.auth.getSocialAuthUrl('google');
      return { success: true, authUrl: response.url };
    } catch (error: any) {
      return { success: false, message: error.message || "Google 로그인 URL을 가져오는데 실패했습니다." };
    }
  };

  const handleGoogleCallback = async (code: string) => {
    try {
      const response = await diffsome.auth.socialCallback('google', code);

      setUser(response.user);
      setToken(response.token);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: response.user, token: response.token })
      );
      return { success: true, message: "소셜 로그인에 성공했습니다." };
    } catch (error: any) {
      return { success: false, message: error.message || "소셜 로그인에 실패했습니다." };
    }
  };

  const handleSocialCallback = (token: string, user: User) => {
    setUser(user);
    setToken(token);
    diffsome.auth.setToken(token);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ user, token })
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        getGoogleAuthUrl,
        handleGoogleCallback,
        handleSocialCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
