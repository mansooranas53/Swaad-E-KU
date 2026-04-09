import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { Profile } from "@workspace/api-client-react/src/generated/api.schemas";
import { useGetMe, useLogin, useSignup, useLogout } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      retry: false,
    }
  });

  const logoutMutation = useLogout();

  const handleLogout = () => {
    localStorage.removeItem("canteeniq_token");
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        refetch();
        setLocation("/auth");
      }
    });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = window.location.pathname;
      if (!currentPath.endsWith("/auth")) {
        setLocation("/auth");
      }
    } else if (!isLoading && user) {
      const currentPath = window.location.pathname;
      if (currentPath === "/auth" || currentPath === "/") {
        setLocation(`/${user.role}`);
      } else if (!currentPath.startsWith(`/${user.role}`)) {
         // Prevent roles accessing wrong paths
         setLocation(`/${user.role}`);
      }
    }
  }, [user, isLoading, setLocation]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
