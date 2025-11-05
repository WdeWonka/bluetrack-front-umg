// app/login/services/auth.service.ts
import { toast } from "react-hot-toast";

import { Role } from "@/shared/constants/roles.constant";
import { LOGIN_PATH } from "@/shared/config/paths.config";

const ERROR_MESSAGES = {
  credentials: "Por favor ingresa tus credenciales",
  unexpected: "Ocurrió un error inesperado, inténtalo de nuevo",
  userNotFound: "Email o contraseña incorrectos",
  incorrectPassword: "Email o contraseña incorrectos",
  serverUnreachable: "No se pudo conectar con el servidor",
  userInactive: "Tu cuenta está inactiva, contacta a soporte",
  sessionClosed: "Tu sesión ha expirado, por favor inicia sesión nuevamente",
};

interface LoginFetchResponse {
  statusCode: number;
  message: string;
  response: LoginResponse | null;
  user?: LoginResponse | null;
  error: null | string;
}

export interface LoginResponse {
  id: number;
  nombre: string;
  email: string;
  rol: Role;
  dpi: string;
  activo: boolean;
}

// 🆕 Clases de error personalizadas
export class NetworkError extends Error {
  constructor(message: string = "Network error") {
    super(message);
    this.name = "NetworkError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

class AuthService {
  /**
   * Login - Autentica al usuario
   * El backend guarda el token en cookie HttpOnly automáticamente
   */
  public async login(
    email: string,
    password: string,
  ): Promise<LoginFetchResponse> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // 🔑 Incluye cookies
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok && data.user) {
        return {
          statusCode: 200,
          message: "Login exitoso",
          response: data.user,
          user: data.user, // ✅ Facilita el acceso directo al usuario
          error: null,
        };
      }

      if (response.status === 401) {
        return {
          statusCode: 401,
          message: data.detail || ERROR_MESSAGES.incorrectPassword,
          response: null,
          user: null,
          error: data.detail,
        };
      }

      return {
        statusCode: response.status,
        message: data.detail || ERROR_MESSAGES.unexpected,
        response: null,
        user: null,
        error: data.detail,
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        statusCode: 500,
        message: ERROR_MESSAGES.serverUnreachable,
        response: null,
        user: null,
        error: "Network error",
      };
    }
  }

  /**
   * Logout - Cierra sesión
   * El backend limpia la cookie HttpOnly
   */
  public async logout(): Promise<void> {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 🔑 IMPORTANTE: Forzar recarga completa para limpiar todo el estado
      if (typeof window !== "undefined") {
        window.location.href = LOGIN_PATH;
      }
    }
  }

  /**
   * Obtiene info del usuario actual desde el backend
   * 🆕 Ahora lanza errores específicos en lugar de retornar null
   */
  public async getCurrentUser(): Promise<LoginResponse> {
    try {
      console.log("[AuthService] Fetching current user...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/me`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      console.log("[AuthService] Response status:", response.status);

      if (response.ok) {
        const userData = await response.json();

        return userData;
      }

      if (response.status === 401) {
        throw new UnauthorizedError("User not authenticated");
      }

      // Otros errores HTTP
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      // Si es un error que ya lanzamos, re-lanzarlo
      if (error instanceof UnauthorizedError) {
        throw error;
      }

      // Errores de red (servidor apagado, sin internet, etc.)
      if (
        error instanceof TypeError ||
        error.message?.includes("fetch") ||
        error.message?.includes("Failed to fetch") ||
        error.message?.includes("NetworkError") ||
        error.message?.includes("Network request failed")
      ) {
        throw new NetworkError("Server unreachable");
      }

      // Otros errores desconocidos
      throw error;
    }
  }

  /**
   * Maneja respuestas de fetch (para los fetchers personalizados)
   */
  public async handleResponse(response: Response) {
    // Manejar errores HTTP de autenticación/autorización
    if (response.status === 401) {
      await this.handleUnauthorized();
      throw new UnauthorizedError("Unauthorized");
    }

    if (response.status === 403) {
      toast.error("No tienes permisos para realizar esta acción");
      throw new Error("Forbidden");
    }

    // ✅ Si el HTTP no es OK (errores reales de servidor/red)
    if (!response.ok) {
      const data = await response.json().catch(() => ({
        statusCode: response.status,
        error: "Error desconocido",
      }));

      throw new Error(data.detail || data.error || "Error en la solicitud");
    }

    // ✅ Parsear el JSON
    const data = await response.json().catch(() => ({
      statusCode: response.status,
      error: "Error desconocido",
    }));

    return data;
  }

  /**
   * Maneja cuando el usuario no está autorizado
   */
  private async handleUnauthorized(): Promise<void> {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "";

    if (currentPath !== LOGIN_PATH && currentPath !== "/") {
      toast.error(ERROR_MESSAGES.sessionClosed);
    }

    if (typeof window !== "undefined") {
      window.location.replace(LOGIN_PATH);
    }
  }
}

export default new AuthService();
