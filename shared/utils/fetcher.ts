// lib/fetchers.ts
import authService from "@/app/login/services/auth.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Configuración base para todas las peticiones
 * Usa cookies HttpOnly automáticamente
 */
const getBaseConfig = (options: RequestInit = {}): RequestInit => ({
  credentials: "include", // 🔑 Siempre incluir cookies (esto envía el token)
  headers: {
    "Content-Type": "application/json",
    ...options.headers,
  },
  ...options,
});

/**
 * Fetcher genérico para SWR
 */
export const fetcher = async (url: string) => {
  const response = await fetch(url, getBaseConfig());

  return authService.handleResponse(response);
};

/**
 * GET request
 */
export const getFetcher = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...getBaseConfig(options),
    method: "GET",
  });

  return authService.handleResponse(response);
};

/**
 * POST request
 */
export const postFetcher = async (
  url: string,
  body: any,
  options: RequestInit = {},
  formData: FormData | null = null,
) => {
  const config = getBaseConfig(options);

  if (formData) {
    // Para FormData, eliminar Content-Type (el navegador lo establece automáticamente)
    const { "Content-Type": _, ...restHeaders } = config.headers as Record<
      string,
      string
    >;

    config.headers = restHeaders;
    config.body = formData;
  } else {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...config,
    method: "POST",
  });

  return authService.handleResponse(response);
};

/**
 * PUT request
 */
export const putFetcher = async (
  url: string,
  body: any,
  options: RequestInit = {},
) => {
  const response = await fetch(url, {
    ...getBaseConfig(options),
    method: "PUT",
    body: JSON.stringify(body),
  });

  return authService.handleResponse(response);
};

/**
 * PATCH request
 */
export const patchFetcher = async (
  url: string,
  body: any,
  options: RequestInit = {},
) => {
  const response = await fetch(url, {
    ...getBaseConfig(options),
    method: "PATCH",
    body: JSON.stringify(body),
  });

  return authService.handleResponse(response);
};

/**
 * DELETE request
 */
export const deleteFetcher = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...getBaseConfig(options),
    method: "DELETE",
  });

  return authService.handleResponse(response);
};

/**
 * GET request para descargar archivos
 */
export const getFileFetcher = async (
  url: string,
  options: RequestInit = {},
): Promise<Blob> => {
  const config = getBaseConfig(options);

  // Remover Content-Type para archivos
  const headers = (config.headers as Record<string, string>) || {};
  const { "Content-Type": _, ...restHeaders } = headers;

  const response = await fetch(url, {
    ...config,
    headers: restHeaders,
    method: "GET",
  });

  // Si no es exitoso, intentar manejar el error
  if (!response.ok) {
    // Intentar parsear como JSON primero (para errores del backend)
    try {
      const errorData = await response.json();

      await authService.handleResponse(response);
      throw new Error(errorData.message || "Error al descargar el archivo");
    } catch (jsonError) {
      // Si no es JSON, manejar como error genérico
      await authService.handleResponse(response);
      throw new Error("Error al descargar el archivo");
    }
  }

  return await response.blob();
};

/**
 * POST request para descargar archivos
 */
export const postFileFetcher = async (
  url: string,
  body: any = {},
  options: RequestInit = {},
  formData: FormData | null = null,
): Promise<Blob> => {
  const config = getBaseConfig(options);

  if (formData) {
    const headers = (config.headers as Record<string, string>) || {};
    const { "Content-Type": _, ...restHeaders } = headers;

    config.headers = restHeaders;
    config.body = formData;
  } else {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...config,
    method: "POST",
  });

  if (!response.ok) {
    try {
      const errorData = await response.json();

      await authService.handleResponse(response);
      throw new Error(errorData.message || "Error al descargar el archivo");
    } catch (jsonError) {
      await authService.handleResponse(response);
      throw new Error("Error al descargar el archivo");
    }
  }

  return await response.blob();
};
