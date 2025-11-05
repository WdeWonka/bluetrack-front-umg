import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { ORDERS_BASE_URL } from "@/shared/config/endpoints.config";
import { ROWS_PER_PAGE } from "@/shared/constants/pagination.constants";

interface PaginationConfig {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface Order {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  producto_nombre: string;
  cantidad: number;
  prioridad: string;
  asignada: boolean;
  cancelada?: boolean;
  fecha_solicitud: string;
  ruta_id?: number | null;
}

interface UseOrdersOptions {
  initialPage?: number;
  initialPageSize?: number;
  includeCancelled?: boolean;
}

const useOrders = (options?: UseOrdersOptions) => {
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    totalRecords: 0,
    totalPages: 0,
    currentPage: options?.initialPage || 1,
    pageSize: options?.initialPageSize || ROWS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimer, setSearchTimer] = useState<NodeJS.Timeout | null>(null);
  const [includeCancelled, setIncludeCancelled] = useState(
    options?.includeCancelled ?? false // 🆕 Estado para canceladas
  );

  const getUrl = useCallback(() => {
    // Si hay búsqueda, usar endpoint de search
    if (searchTerm.trim()) {
      const skip =
        (paginationConfig.currentPage - 1) * paginationConfig.pageSize;
      const searchParams = new URLSearchParams({
        q: searchTerm.trim(),
        skip: String(skip),
        limit: String(paginationConfig.pageSize),
        include_cancelled: String(includeCancelled), // 🆕 Agregar aquí también
      });

      return `${ORDERS_BASE_URL}/search?${searchParams.toString()}`;
    }

    // Si no hay búsqueda, usar endpoint de listado normal
    const params = new URLSearchParams({
      page: String(paginationConfig.currentPage),
      per_page: String(paginationConfig.pageSize),
      include_cancelled: String(includeCancelled),
    });

    return `${ORDERS_BASE_URL}?${params.toString()}`;
  }, [
    paginationConfig.currentPage,
    paginationConfig.pageSize,
    searchTerm,
    includeCancelled,
  ]);

  const fetcher = useCallback(async (url: string) => getFetcher(url), []);

  const { data, error, mutate } = useSWR(getUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (data?.response) {
      const pagination = data.response.pagination;

      if (pagination) {
        setPaginationConfig((prev) => ({
          ...prev,
          totalRecords: pagination.total_items || 0,
          totalPages: pagination.total_pages || 0,
          currentPage: pagination.page || prev.currentPage,
          hasNext: pagination.has_next || false,
          hasPrev: pagination.has_prev || false,
        }));
      }
    }
  }, [data]);

  const updatePageSize = (size: number) => {
    setPaginationConfig((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
  };

  const updateCurrentPage = (page: number) => {
    setPaginationConfig((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handleSearch = (term: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (term.trim() === "") {
      setSearchTerm("");
      setPaginationConfig((prev) => ({ ...prev, currentPage: 1 }));
    } else {
      setSearchTimer(
        setTimeout(() => {
          setSearchTerm(term.trim());
          setPaginationConfig((prev) => ({ ...prev, currentPage: 1 }));
        }, 500)
      );
    }
  };

  // 🆕 Función para toggle canceladas
  const toggleIncludeCancelled = () => {
    setIncludeCancelled((prev) => !prev);
    setPaginationConfig((prev) => ({ ...prev, currentPage: 1 }));
  };

  const loading = !data && !error;

  // Obtener órdenes del backend
  const orders: Order[] =
    data?.response?.orders || data?.response?.ordenes || [];

  return {
    error,
    loading,
    orders,
    paginationConfig,
    updatePageSize,
    updateCurrentPage,
    refetch: mutate,
    searchQuery: handleSearch,
    searchTerm,
    includeCancelled, // 🆕 Exportar estado
    toggleIncludeCancelled, // 🆕 Exportar función toggle
    setIncludeCancelled, // 🆕 Exportar setter directo
  };
};

export default useOrders;
