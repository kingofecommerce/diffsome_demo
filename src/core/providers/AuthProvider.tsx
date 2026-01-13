import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthResponse } from "@/types/auth";
import { diffsome } from "@/core/lib/diffsome";

interface SocialAuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
    is_new_user: boolean;
  };
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
const API_KEY = "pky_zX1JITGIZefP9Fm2oBF9qk7oekwNmlqJ7uRfBXznbRi3P9kAfq2CM6hiBX8B";

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
        // Set token on SDK
        diffsome.setToken(token);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("https://diffsome.webbyon.com/api/demo/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ email, password }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        // Set token on SDK
        diffsome.setToken(data.data.token);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: data.data.user, token: data.data.token })
        );
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "로그인에 실패했습니다." };
      }
    } catch (error) {
      return { success: false, message: "네트워크 오류가 발생했습니다." };
    }
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const response = await fetch("https://diffsome.webbyon.com/api/demo/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      const data: AuthResponse = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        // Set token on SDK
        diffsome.setToken(data.data.token);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: data.data.user, token: data.data.token })
        );
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "회원가입에 실패했습니다." };
      }
    } catch (error) {
      return { success: false, message: "네트워크 오류가 발생했습니다." };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch("https://diffsome.webbyon.com/api/demo/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": API_KEY,
            "Authorization": `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      setUser(null);
      setToken(null);
      // Clear token from SDK
      diffsome.setToken(null);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const getGoogleAuthUrl = async () => {
    try {
      const response = await fetch("https://diffsome.webbyon.com/api/demo/auth/social/google/url", {
        headers: {
          "X-API-Key": API_KEY,
        },
      });
      const data = await response.json();
      
      if (data.data?.auth_url) {
        return { success: true, authUrl: data.data.auth_url };
      }
      return { success: false, message: "Google 로그인 URL을 가져오는데 실패했습니다." };
    } catch (error) {
      return { success: false, message: "네트워크 오류가 발생했습니다." };
    }
  };

  const handleGoogleCallback = async (code: string) => {
    try {
      const response = await fetch("https://diffsome.webbyon.com/api/demo/auth/social/google/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": API_KEY,
        },
        body: JSON.stringify({ code }),
      });

      const data: SocialAuthResponse = await response.json();

      if (data.success) {
        setUser(data.data.user);
        setToken(data.data.token);
        // Set token on SDK
        diffsome.setToken(data.data.token);
        localStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({ user: data.data.user, token: data.data.token })
        );
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message || "소셜 로그인에 실패했습니다." };
      }
    } catch (error) {
      return { success: false, message: "네트워크 오류가 발생했습니다." };
    }
  };

  const handleSocialCallback = (token: string, user: User) => {
    setUser(user);
    setToken(token);
    // Set token on SDK
    diffsome.setToken(token);
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
