import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { CUSTOMERS_BASE_URL } from "@/shared/config/endpoints.config";
import { ROWS_PER_PAGE } from "@/shared/constants/pagination.constants";

interface PaginationConfig {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interfaz para los clientes (tal como viene del backend)
export interface Customer {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  latitud: number;
  longitud: number;
  creado_en?: string;
  actualizado_en?: string;
}

interface UseCustomersOptions {
  initialPage?: number;
  initialPageSize?: number;
}

const useCustomers = (options?: UseCustomersOptions) => {
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

  const getUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(paginationConfig.currentPage),
      per_page: String(paginationConfig.pageSize),
    });

    // Si hay búsqueda, usar endpoint de search
    if (searchTerm.trim()) {
      params.append("q", searchTerm.trim());

      return `${CUSTOMERS_BASE_URL}/search?${params.toString()}`;
    }

    // Si no hay búsqueda, usar endpoint de listado normal
    return `${CUSTOMERS_BASE_URL}?${params.toString()}`;
  }, [paginationConfig.currentPage, paginationConfig.pageSize, searchTerm]);

  const fetcher = useCallback(async (url: string) => getFetcher(url), []);

  const { data, error, mutate } = useSWR(getUrl, fetcher, {
    revalidateOnFocus: false,
  });

  useEffect(() => {
    if (data?.response) {
      const pagination = data.response.pagination;

      setPaginationConfig((prev) => ({
        ...prev,
        totalRecords: pagination.total_items,
        totalPages: pagination.total_pages,
        currentPage: pagination.page,
        hasNext: pagination.has_next,
        hasPrev: pagination.has_prev,
      }));
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
        }, 500),
      );
    }
  };

  const loading = !data && !error;

  // Obtener clientes directamente del backend
  const customers: Customer[] = data?.response?.customers
    ? data.response.customers.map((customer: any) => ({
        ...customer,
      }))
    : [];

  return {
    error,
    loading,
    customers,
    paginationConfig,
    updatePageSize,
    updateCurrentPage,
    refetch: mutate,
    searchQuery: handleSearch,
    searchTerm,
  };
};

export default useCustomers;
