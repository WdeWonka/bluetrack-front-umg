import type { EstadoRuta } from "@/app/dashboard/routes/services/route.service";

import { useCallback, useMemo } from "react";
import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { ROUTES_BASE_URL } from "@/shared/config/endpoints.config";

export interface RouteListItem {
  id: number;
  nombre: string;
  vendedor_id: number;
  vendedor_nombre?: string;
  almacen_id: number;
  almacen_nombre?: string;
  fecha: string;
  estado: EstadoRuta;
  total_clientes: number;
}

interface UseSellerRoutesOptions {
  vendedor_id?: number;
  estado?: EstadoRuta;
  pageSize?: number;
  showCancelled?: boolean;
}

/**
 * Hook específico para obtener las rutas de un vendedor
 * Diseñado para el calendario y vistas de vendedor
 *
 * @param options.showCancelled - Si es false (default), oculta rutas canceladas
 */
const useSellerRoutes = (options: UseSellerRoutesOptions = {}) => {
  const {
    vendedor_id,
    estado,
    pageSize = 100,
    showCancelled = false,
  } = options;

  const getUrl = useCallback(() => {
    // ✅ Solo hacer fetch si tenemos vendedor_id
    if (!vendedor_id) {
      return null;
    }

    const params = new URLSearchParams({
      page: "1",
      per_page: String(pageSize),
      vendedor_id: String(vendedor_id),
    });

    if (estado) {
      params.append("estado", estado);
    }

    return `${ROUTES_BASE_URL}?${params.toString()}`;
  }, [vendedor_id, estado, pageSize]);

  const fetcher = useCallback(async (url: string) => {
    const result = await getFetcher(url);

    return result;
  }, []);

  const swrKey = getUrl();

  const { data, error, mutate } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
    refreshInterval: 5 * 60 * 1000,
  });

  const loading = swrKey !== null && !data && !error;

  const routes: RouteListItem[] = useMemo(() => {
    const allRoutes = data?.response?.routes || [];

    // Si showCancelled es false, excluir las canceladas
    if (!showCancelled) {
      return allRoutes.filter(
        (route: RouteListItem) => route.estado !== "cancelada"
      );
    }

    return allRoutes;
  }, [data?.response?.routes, showCancelled]);

  return {
    routes,
    loading,
    error,
    refetch: mutate,
    totalRoutes: routes.length,
    isReady: !!vendedor_id,
  };
};

export default useSellerRoutes;
