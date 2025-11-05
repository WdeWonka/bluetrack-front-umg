import {
  getFetcher,
  postFetcher,
  patchFetcher, // ✅ Importar patchFetcher
  getFileFetcher,
} from "@/shared/utils/fetcher";
import { PRODUCTS_BASE_URL } from "@/shared/config/endpoints.config";

export interface CreateProductPayload {
  nombre: string;
  precio: number;
  stock_total: number;
}

export interface UpdateProductPayload {
  nombre?: string;
  precio?: number;
  stock_total?: number;
  activo?: boolean;
}

export interface ProductUsageInfo {
  producto_id: number;
  nombre: string;
  stock_actual: number;
  puede_eliminarse: boolean;
  uso: {
    rutas_pendientes: number;
    rutas_en_proceso: number;
    rutas_completadas: number;
    ordenes_pendientes: number;
  };
  mensaje: string;
}

class ProductService {
  /**
   * Crear un nuevo producto
   */
  public async create(data: CreateProductPayload) {
    try {
      return await postFetcher(`${PRODUCTS_BASE_URL}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un producto
   */
  public async update(id: number, data: UpdateProductPayload) {
    try {
      return await patchFetcher(`${PRODUCTS_BASE_URL}/${id}`, data); // ✅ Usar patchFetcher
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los productos (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${PRODUCTS_BASE_URL}?${query}`
      : `${PRODUCTS_BASE_URL}`;

    try {
      return await getFetcher(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar productos por nombre
   */
  public async search(params: { q: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams({
      q: params.q,
      page: String(params.page || 1),
      per_page: String(params.per_page || 10),
    }).toString();

    try {
      return await getFetcher(`${PRODUCTS_BASE_URL}/search?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un producto por ID
   */
  public async getProductById(id: number) {
    try {
      const res = await getFetcher(`${PRODUCTS_BASE_URL}/${id}`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Importar productos desde Excel
   */
  public async importFromExcel(file: File) {
    try {
      const formData = new FormData();

      formData.append("file", file);

      return await postFetcher(`${PRODUCTS_BASE_URL}/import`, {}, {}, formData);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar productos a Excel
   */
  public async exportToExcel() {
    try {
      const blob = await getFileFetcher(`${PRODUCTS_BASE_URL}/export/excel`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `productos_${new Date().toISOString().split("T")[0]}.xlsx`;
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
   * Exportar productos a PDF
   */
  public async exportToPdf() {
    try {
      const blob = await getFileFetcher(`${PRODUCTS_BASE_URL}/export/pdf`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reporte_productos_${new Date().toISOString().split("T")[0]}.pdf`;
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
   * Descargar template de Excel
   */
  public async downloadTemplate() {
    try {
      const blob = await getFileFetcher(`${PRODUCTS_BASE_URL}/template`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template_productos.xlsx";
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
   * Verificar uso del producto antes de eliminar
   */
  public async checkUsage(id: number): Promise<ProductUsageInfo> {
    try {
      const res = await getFetcher(`${PRODUCTS_BASE_URL}/${id}/usage`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soft delete de un producto
   */
  public async delete(id: number) {
    try {
      const response = await fetch(`${PRODUCTS_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Error al eliminar el producto");
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default new ProductService();
