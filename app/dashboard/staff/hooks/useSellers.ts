import useSWR from "swr";

import { getFetcher } from "@/shared/utils/fetcher";
import { STAFF_BASE_URL } from "@/shared/config/endpoints.config";
export interface Seller {
  id: number;
  nombre: string;
  email: string;
  dpi: string;
}

/**
 * Hook para obtener todos los vendedores activos
 */
export const useSellers = () => {
  const { data, error, mutate } = useSWR(
    `${STAFF_BASE_URL}/sellers`,
    getFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    sellers: data?.response?.sellers
      ? data.response.sellers.map((seller: Seller) => ({
          ...seller,
          nombre: capitalizeWords(seller.nombre || ""),
        }))
      : [],
    total: data?.response?.total || 0,
    loading: !data && !error,
    error,
    refetch: mutate,
  };
};

/**
 * Hook para obtener vendedores disponibles en una fecha específica
 */
export const useAvailableSellers = (fecha: string | null) => {
  const shouldFetch = fecha && fecha.trim() !== "";

  const { data, error, mutate } = useSWR(
    shouldFetch ? `${STAFF_BASE_URL}/sellers/available?fecha=${fecha}` : null,
    getFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const capitalizeWords = (str: string) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    sellers: data?.response?.sellers
      ? data.response.sellers.map((seller: Seller) => ({
          ...seller,
          nombre: capitalizeWords(seller.nombre || ""),
        }))
      : [],
    total: data?.response?.total || 0,
    fecha: data?.response?.fecha || fecha,
    loading: shouldFetch && !data && !error,
    error,
    refetch: mutate,
  };
};

export default useSellers;
