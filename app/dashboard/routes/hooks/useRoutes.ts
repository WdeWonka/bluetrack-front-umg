import type { EstadoRuta } from "../services/route.service";

import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { ROUTES_BASE_URL } from "@/shared/config/endpoints.config";
import { ROWS_PER_PAGE } from "@/shared/constants/pagination.constants";

interface PaginationConfig {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

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

interface UseRoutesOptions {
  initialPage?: number;
  initialPageSize?: number;
  estado?: EstadoRuta;
  vendedor_id?: number;
}

const useRoutes = (options?: UseRoutesOptions) => {
  const [paginationConfig, setPaginationConfig] = useState<PaginationConfig>({
    totalRecords: 0,
    totalPages: 0,
    currentPage: options?.initialPage || 1,
    pageSize: options?.initialPageSize || ROWS_PER_PAGE,
    hasNext: false,
    hasPrev: false,
  });

  const getUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(paginationConfig.currentPage),
      per_page: String(paginationConfig.pageSize),
    });

    if (options?.estado) {
      params.append("estado", options.estado);
    }
    if (options?.vendedor_id) {
      params.append("vendedor_id", String(options.vendedor_id));
    }

    return `${ROUTES_BASE_URL}?${params.toString()}`;
  }, [
    paginationConfig.currentPage,
    paginationConfig.pageSize,
    options?.estado,
    options?.vendedor_id,
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

  const loading = !data && !error;

  const routes: RouteListItem[] = data?.response?.routes || [];

  return {
    error,
    loading,
    routes,
    paginationConfig,
    updatePageSize,
    updateCurrentPage,
    refetch: mutate,
  };
};

export default useRoutes;
