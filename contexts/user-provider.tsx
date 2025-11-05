"use client";

import type { Role } from "@/shared/constants/roles.constant";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import useSWR from "swr";

import { ROLES } from "@/shared/constants/roles.constant";
import authService, {
  LoginResponse,
  NetworkError,
  UnauthorizedError,
} from "@/app/login/services/auth.service";

interface User extends LoginResponse {}

interface AuthErrors {
  serverUnreachable: boolean;
  unauthorized: boolean;
  unknownError: boolean;
}

interface UserContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  errors: AuthErrors | null;
  refetch: () => void;
  isInitialized: boolean; // ✅ Nuevo: indica si ya intentó cargar el usuario
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // ✅ Tracking de inicialización

  // ✅ Solo hacer fetch si NO estamos en rutas públicas
  const isPublicRoute = pathname === "/login" || pathname === "/unauthorized";

  // ✅ Activar fetch después de montar el componente y si NO es ruta pública
  useEffect(() => {
    if (!isPublicRoute) {
      // Pequeño delay para asegurar que el token esté disponible después del login
      const timer = setTimeout(() => {
        setShouldFetch(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShouldFetch(false);
      setIsInitialized(true); // En rutas públicas, marcar como inicializado inmediatamente
    }
  }, [isPublicRoute]);

  const fetcher = async () => {
    try {
      const user = await authService.getCurrentUser();

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedError && isPublicRoute) {
        return null;
      }
      throw error;
    }
  };

  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch && !isPublicRoute ? "/auth/me" : null,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
      dedupingInterval: 2000,
      revalidateIfStale: false,
      onSuccess: () => {
        setIsInitialized(true);
      },
      onError: (err) => {
        setIsInitialized(true);

        if (!isPublicRoute) {
          if (err instanceof UnauthorizedError) {
            router.push("/login");
          }
        }
      },
    },
  );

  const errors: AuthErrors | null = error
    ? {
        serverUnreachable: error instanceof NetworkError,
        unauthorized: error instanceof UnauthorizedError,
        unknownError: false,
      }
    : null;

  if (errors) {
    errors.unknownError = !errors.serverUnreachable && !errors.unauthorized;
  }

  const value: UserContextType = {
    user: data || null,
    role: data?.rol || ROLES.OPERATOR,
    loading: isLoading && !data && !isPublicRoute,
    errors: isPublicRoute ? null : errors,
    isInitialized, // ✅ Exponer estado de inicialización
    refetch: () => {
      setShouldFetch(true);
      mutate();
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);

  if (!context) throw new Error("useUser must be used within a UserProvider");

  return context;
}
