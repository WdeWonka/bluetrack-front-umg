import {
  getFetcher,
  postFetcher,
  getFileFetcher,
} from "@/shared/utils/fetcher";
import { ROUTES_BASE_URL } from "@/shared/config/endpoints.config";

// ==================== TYPES ====================

export type EstadoRuta =
  | "pendiente"
  | "en_proceso"
  | "completada"
  | "cancelada";
export type EstadoEntrega = "entregado" | "no_entregado";

export interface CreateRoutePayload {
  nombre: string;
  vendedor_id: number;
  almacen_id: number;
  fecha: string; // YYYY-MM-DD
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

export interface RouteDetail {
  id: number;
  nombre: string;
  vendedor_id: number;
  almacen_id: number;
  fecha: string;
  estado: EstadoRuta;
  inicio_timestamp: string | null;
  fin_timestamp: string | null;
  detalles: RouteClientDetail[];
  total_clientes: number;
}

export interface RouteClientDetail {
  id: number;
  cliente_id: number;
  orden: number;
  estado_entrega: EstadoEntrega;
  motivo?: string | null;
}

// ==================== NUEVOS TIPOS PARA OPTIMIZACIÓN ====================

export interface NextClientToVisit {
  detalle_id: number;
  cliente_id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  latitud: number | null;
  longitud: number | null;
  orden_visita: number;
  productos: ProductoCliente[];
}

export interface ProductoCliente {
  orden_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface OptimizationResult {
  route_id: number;
  total_clientes: number;
  distancia_total_km: number;
  distancia_promedio_km: number;
  orden_optimizado: ClienteOrdenado[];
  segmentos: Segmento[];
}

export interface ClienteOrdenado {
  detalle_id: number;
  cliente_id: number;
  cliente_nombre: string;
  nuevo_orden: number;
  latitud: number;
  longitud: number;
}

export interface Segmento {
  desde: string;
  hacia: string;
  distancia_km: number;
}

// ==================== TIPOS EXISTENTES ====================

export interface ClienteActual {
  detalle_id: number;
  cliente_id: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  orden_visita: number;
  precio_total: number;
  productos: ProductoOrden[];
}

export interface ProductoOrden {
  orden_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  prioridad: number;
}

export interface RouteWithCurrentClient {
  ruta_id: number;
  ruta_nombre: string;
  estado_ruta: EstadoRuta;
  completado: boolean;
  mensaje?: string;
  cliente_actual?: ClienteActual;
  progreso: {
    total_clientes: number;
    visitados: number;
    pendientes: number;
    porcentaje: number;
  };
}

export interface InventoryItem {
  producto_id: number;
  nombre: string;
  cantidad_inicial: number;
  cantidad_actual: number;
  cantidad_entregada: number;
  porcentaje_entregado: number;
}

export interface RouteInventoryStatus {
  productos: InventoryItem[];
  total_inicial: number;
  total_actual: number;
  total_entregado: number;
  porcentaje_entregado: number;
}

export interface ClienteDetailWithOrders {
  detalle_id: number;
  cliente_id: number;
  cliente_nombre: string;
  orden_visita: number;
  estado_entrega: EstadoEntrega;
  timestamp_entrega: string | null;
  motivo: string | null;
  fue_visitado: boolean;
  ordenes: OrdenDetalle[];
  entregas: EntregaRegistrada[];
}

export interface OrdenDetalle {
  orden_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad_ordenada: number;
  cantidad_entregada: number;
  cantidad_pendiente: number;
  prioridad: number;
}

export interface EntregaRegistrada {
  orden_id: number;
  producto_id: number;
  cantidad_entregada: number;
}

export interface RouteProgress {
  ruta_id: number;
  estado_ruta: EstadoRuta;
  total_clientes: number;
  visitados: number;
  pendientes: number;
  entregados: number;
  no_entregados: number;
  porcentaje_avance: number;
  total_esperado: number;
  total_entregado: number;
  perdida_estimada: number;
  detalles: ClienteProgressDetail[];
}

export interface ClienteProgressDetail {
  detalle_id: number;
  cliente_id: number;
  cliente_nombre: string;
  orden_visita: number;
  estado_entrega: EstadoEntrega;
  motivo: string | null;
  timestamp: string | null;
  subtotal_esperado: number;
  subtotal_entregado: number;
}

export interface RouteFinancialSummary {
  ruta_id: number;
  ruta_nombre: string;
  estado: EstadoRuta;
  fecha: string;
  resumen_financiero: {
    total_esperado: number;
    total_entregado: number;
    perdida: number;
    porcentaje_cobrado: number;
  };
  resumen_inventario: {
    total_unidades_cargadas: number;
    total_unidades_entregadas: number;
    total_unidades_devueltas: number;
    porcentaje_vendido: number;
    productos: ProductoInventario[];
  };
  resumen_clientes: {
    total_clientes: number;
    clientes_entregados: number;
    clientes_no_entregados: number;
    tasa_conversion: number;
  };
  clientes: ClienteFinancialDetail[];
}

export interface ProductoInventario {
  producto_id: number;
  producto_nombre: string;
  cantidad_cargada: number;
  cantidad_entregada: number;
  cantidad_devuelta: number;
  porcentaje_vendido: number;
}

export interface ClienteFinancialDetail {
  detalle_id: number;
  cliente_id: number;
  cliente_nombre: string;
  orden_visita: number;
  estado_entrega: EstadoEntrega;
  subtotal_esperado: number;
  subtotal_entregado: number;
  productos: ProductoFinancial[];
}

export interface ProductoFinancial {
  producto_id: number;
  producto_nombre: string;
  precio_unitario: number;
  cantidad_ordenada: number;
  cantidad_entregada: number;
  monto_esperado: number;
  monto_entregado: number;
}

// ==================== SERVICE ====================

class RouteService {
  /**
   * Crear una nueva ruta automática
   */
  public async create(data: CreateRoutePayload) {
    try {
      return await postFetcher(`${ROUTES_BASE_URL}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todas las rutas (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams({
      page: String(params.page || 1),
      per_page: String(params.per_page || 10),
    }).toString();

    try {
      return await getFetcher(`${ROUTES_BASE_URL}?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener una ruta por ID
   */
  public async getById(id: number) {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}`);
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Iniciar ruta (PENDIENTE → EN_PROCESO)
   * Automáticamente optimiza el orden de visitas
   */
  public async startRoute(id: number) {
    try {
      return await postFetcher(`${ROUTES_BASE_URL}/${id}/start`, {});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finalizar ruta (EN_PROCESO → COMPLETADA)
   */
  public async completeRoute(id: number) {
    try {
      return await postFetcher(`${ROUTES_BASE_URL}/${id}/complete`, {});
    } catch (error) {
      throw error;
    }
  }

  // ==================== NUEVOS MÉTODOS DE OPTIMIZACIÓN ====================

  /**
   * Optimizar orden de visitas manualmente
   */
  public async optimizeRouteOrder(id: number): Promise<OptimizationResult> {
    try {
      const res = await postFetcher(
        `${ROUTES_BASE_URL}/${id}/optimize-order`,
        {}
      );
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener siguiente cliente a visitar
   */
  public async getNextClient(id: number): Promise<NextClientToVisit | null> {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}/next-client`);

      if (res.response.completado) {
        return null;
      }

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  // ==================== MÉTODOS EXISTENTES ====================

  /**
   * Obtener cliente actual a visitar
   */
  public async getCurrentClient(id: number): Promise<RouteWithCurrentClient> {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}/current-cliente`);
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener inventario de la ruta
   */
  public async getInventory(id: number): Promise<RouteInventoryStatus> {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}/inventory`);
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener progreso de entregas con precios
   */
  public async getProgress(id: number): Promise<RouteProgress> {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}/progress`);
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener resumen financiero completo
   */
  public async getFinancialSummary(id: number): Promise<RouteFinancialSummary> {
    try {
      const res = await getFetcher(`${ROUTES_BASE_URL}/${id}/summary`);
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar resumen a PDF
   */
  public async exportSummaryToPdf(id: number) {
    try {
      const blob = await getFileFetcher(`${ROUTES_BASE_URL}/${id}/summary/pdf`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumen_ruta_${id}.pdf`;
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
   * Exportar rutas a Excel
   */
  public async exportToExcel() {
    try {
      const blob = await getFileFetcher(`${ROUTES_BASE_URL}/export/excel`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rutas_reporte.xlsx`;
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
   * Exportar rutas a PDF
   */
  public async exportToPdf() {
    try {
      const blob = await getFileFetcher(`${ROUTES_BASE_URL}/export/pdf`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rutas_reporte.pdf`;
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
   * Cancelar ruta (PENDIENTE → CANCELADA)
   */
  public async cancelRoute(id: number, motivo: string) {
    try {
      return await postFetcher(
        `${ROUTES_BASE_URL}/${id}/cancel?motivo=${encodeURIComponent(motivo)}`,
        {}
      );
    } catch (error) {
      throw error;
    }
  }

  // ========== DETALLES DE RUTA ==========

  /**
   * Obtener detalle de cliente con órdenes
   */
  public async getClientDetail(
    routeId: number,
    detailId: number
  ): Promise<ClienteDetailWithOrders> {
    try {
      const res = await getFetcher(
        `${ROUTES_BASE_URL}/${routeId}/details/${detailId}`
      );
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Entregar todas las órdenes automáticamente (SIMPLIFICADO)
   */
  public async deliverAll(routeId: number, detailId: number) {
    try {
      return await postFetcher(
        `${ROUTES_BASE_URL}/${routeId}/details/${detailId}/deliver-all`,
        {}
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Marcar como NO entregado (SIMPLIFICADO)
   */
  public async markNotDelivered(
    routeId: number,
    detailId: number,
    motivo: string
  ) {
    try {
      return await postFetcher(
        `${ROUTES_BASE_URL}/${routeId}/details/${detailId}/mark-not-delivered`,
        { motivo }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registrar entrega personalizada (AVANZADO)
   */
  public async deliverCustom(
    routeId: number,
    detailId: number,
    data: {
      estado_entrega: EstadoEntrega;
      motivo?: string;
      entregas: Array<{
        orden_id: number;
        producto_id: number;
        cantidad: number;
      }>;
    }
  ) {
    try {
      return await postFetcher(
        `${ROUTES_BASE_URL}/${routeId}/details/${detailId}/deliver`,
        data
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar vendedores disponibles
   */
  public async searchSellers(query: string = "", limit: number = 10) {
    try {
      const params = new URLSearchParams({
        query,
        limit: String(limit),
      }).toString();
      const res = await getFetcher(
        `${ROUTES_BASE_URL}/search/sellers?${params}`
      );
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar almacenes disponibles
   */
  public async searchWarehouses(query: string = "", limit: number = 10) {
    try {
      const params = new URLSearchParams({
        query,
        limit: String(limit),
      }).toString();
      const res = await getFetcher(
        `${ROUTES_BASE_URL}/search/warehouses?${params}`
      );
      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener órdenes por fecha
   */
  public async getOrdersByDate(fecha: string) {
    try {
      const res = await getFetcher(
        `${ROUTES_BASE_URL}/orders/by-date?fecha=${fecha}`
      );
      return res.response;
    } catch (error) {
      throw error;
    }
  }
}

export default new RouteService();
