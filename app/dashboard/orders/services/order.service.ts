import {
  getFetcher,
  postFetcher,
  patchFetcher,
  deleteFetcher,
  getFileFetcher,
} from "@/shared/utils/fetcher";
import { ORDERS_BASE_URL } from "@/shared/config/endpoints.config";

export interface CreateOrderPayload {
  cliente_id: number;
  producto_id: number;
  cantidad: number;
  prioridad?: string;
  fecha_solicitud?: string; // DD/MM/YYYY, DD-MM-YYYY o YYYY-MM-DD
}

export interface UpdateOrderPayload {
  cliente_id?: number;
  producto_id?: number;
  cantidad?: number;
  fecha_solicitud?: string;
}

export interface SearchCustomerForOrder {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
}

export interface SearchProductForOrder {
  id: number;
  nombre: string;
  precio: number;
  stock_disponible: number | null;
}

export interface CancelOrderResponse {
  id: number;
  cancelada: boolean;
  cliente_id: number;
  producto_nombre: string;
  cantidad_liberada: number;
}

class OrderService {
  /**
   * Crear una nueva orden
   */
  public async create(data: CreateOrderPayload) {
    try {
      return await postFetcher(`${ORDERS_BASE_URL}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar una orden (solo si no está asignada)
   */
  public async update(id: number, data: UpdateOrderPayload) {
    try {
      return await patchFetcher(`${ORDERS_BASE_URL}/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  public async cancel(id: number) {
    try {
      return await deleteFetcher(`${ORDERS_BASE_URL}/${id}/cancel`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las órdenes (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${ORDERS_BASE_URL}?${query}` : `${ORDERS_BASE_URL}`;

    try {
      return await getFetcher(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar órdenes por cliente o teléfono
   */
  public async search(params: { q: string; skip?: number; limit?: number }) {
    const query = new URLSearchParams({
      q: params.q,
      skip: String(params.skip || 0),
      limit: String(params.limit || 10),
    }).toString();

    try {
      return await getFetcher(`${ORDERS_BASE_URL}/search?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener una orden por ID
   */
  public async getOrderById(id: number) {
    try {
      const res = await getFetcher(`${ORDERS_BASE_URL}/${id}`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar clientes para crear orden
   */
  public async searchCustomers(
    query: string,
    limit: number = 10,
  ): Promise<SearchCustomerForOrder[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: String(limit),
      }).toString();

      const res = await getFetcher(
        `${ORDERS_BASE_URL}/search/customers?${params}`,
      );

      return res.response.clientes;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar productos para crear orden
   */
  public async searchProducts(
    query: string,
    limit: number = 10,
  ): Promise<SearchProductForOrder[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        limit: String(limit),
      }).toString();

      const res = await getFetcher(
        `${ORDERS_BASE_URL}/search/products?${params}`,
      );

      return res.response.productos;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener órdenes pendientes por fecha (para crear ruta)
   */
  public async getOrdersByDate(fecha: string) {
    try {
      // Convertir fecha a formato con guiones (DD-MM-YYYY o YYYY-MM-DD)
      const fechaFormatted = fecha.replace(/\//g, "-");

      return await getFetcher(`${ORDERS_BASE_URL}/date/${fechaFormatted}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar órdenes a Excel
   */
  public async exportToExcel() {
    try {
      const blob = await getFileFetcher(`${ORDERS_BASE_URL}/export/excel`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `ordenes_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar órdenes a PDF
   */
  public async exportToPdf() {
    try {
      const blob = await getFileFetcher(`${ORDERS_BASE_URL}/export/pdf`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reporte_ordenes_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    } catch (error) {
      throw error;
    }
  }
}

export default new OrderService();
