import {
  getFetcher,
  postFetcher,
  getFileFetcher,
  patchFetcher,
} from "@/shared/utils/fetcher";
import { WAREHOUSES_BASE_URL } from "@/shared/config/endpoints.config";

export interface CreateWarehousePayload {
  nombre: string;
  direccion: string;
  telefono: string;
  latitud: number;
  longitud: number;
}

export interface UpdateWarehousePayload {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
}

class WarehouseService {
  /**
   * Crear un nuevo almacén
   */
  public async create(data: CreateWarehousePayload) {
    try {
      return await postFetcher(`${WAREHOUSES_BASE_URL}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un almacén
   */
  public async update(id: number, data: UpdateWarehousePayload) {
    try {
      return await patchFetcher(`${WAREHOUSES_BASE_URL}/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los almacenes (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${WAREHOUSES_BASE_URL}?${query}`
      : `${WAREHOUSES_BASE_URL}`;

    try {
      return await getFetcher(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar almacenes por nombre o dirección
   */
  public async search(params: { q: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams({
      q: params.q,
      page: String(params.page || 1),
      per_page: String(params.per_page || 10),
    }).toString();

    try {
      return await getFetcher(`${WAREHOUSES_BASE_URL}/search?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un almacén por ID
   */
  public async getWarehouseById(id: number) {
    try {
      const res = await getFetcher(`${WAREHOUSES_BASE_URL}/${id}`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Importar almacenes desde Excel
   */
  public async importFromExcel(file: File) {
    try {
      const formData = new FormData();

      formData.append("file", file);

      return await postFetcher(
        `${WAREHOUSES_BASE_URL}/import`,
        {},
        {},
        formData,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar almacenes a Excel
   */
  public async exportToExcel() {
    try {
      const blob = await getFileFetcher(`${WAREHOUSES_BASE_URL}/export/excel`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `almacenes.xlsx`;
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
   * Exportar almacenes a PDF
   */
  public async exportToPdf() {
    try {
      const blob = await getFileFetcher(`${WAREHOUSES_BASE_URL}/export/pdf`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reporte_almacenes.pdf`;
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
      const blob = await getFileFetcher(`${WAREHOUSES_BASE_URL}/template`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template_almacenes.xlsx";
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

export default new WarehouseService();
