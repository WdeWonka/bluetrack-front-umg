import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { STAFF_BASE_URL } from "@/shared/config/endpoints.config";
import { ROWS_PER_PAGE } from "@/shared/constants/pagination.constants";

interface PaginationConfig {
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interfaz para los miembros del staff (tal como viene del backend)
export interface StaffMember {
  id: number;
  nombre: string;
  email: string;
  dpi: string;
  rol: "operador" | "vendedor";
  activo: boolean;
  creado_en?: string;
  actualizado_en?: string;
}

interface UseStaffOptions {
  initialPage?: number;
  initialPageSize?: number;
  role?: "operador" | "vendedor";
}

const useStaff = (options?: UseStaffOptions) => {
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
  const [roleFilter] = useState<"operador" | "vendedor" | undefined>(
    options?.role,
  );

  const getUrl = useCallback(() => {
    const params = new URLSearchParams({
      page: String(paginationConfig.currentPage),
      per_page: String(paginationConfig.pageSize),
    });

    // Si hay búsqueda, usar endpoint de search
    if (searchTerm.trim()) {
      params.append("q", searchTerm.trim());
      if (roleFilter) params.append("role", roleFilter);

      return `${STAFF_BASE_URL}/users/search?${params.toString()}`;
    }

    // Si no hay búsqueda, usar endpoint de listado normal
    return `${STAFF_BASE_URL}/users?${params.toString()}`;
  }, [
    paginationConfig.currentPage,
    paginationConfig.pageSize,
    searchTerm,
    roleFilter,
  ]);

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

  // Capitalizar nombres y mantener estructura del backend
  const staff: StaffMember[] = data?.response?.users
    ? data.response.users.map((member: any) => ({
        ...member,
      }))
    : [];

  return {
    error,
    loading,
    staff,
    paginationConfig,
    updatePageSize,
    updateCurrentPage,
    refetch: mutate,
    searchQuery: handleSearch,
    searchTerm,
  };
};

export default useStaff;
