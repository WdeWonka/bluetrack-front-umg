import {
  getFetcher,
  postFetcher,
  patchFetcher,
  getFileFetcher,
  deleteFetcher,
} from "@/shared/utils/fetcher";
import { STAFF_BASE_URL } from "@/shared/config/endpoints.config";

export interface CreateStaffPayload {
  nombre: string;
  dpi: string;
  email: string;
  password: string;
  rol: "operador" | "vendedor";
}

export interface UpdateStaffPayload {
  nombre?: string;
  dpi?: string;
  email?: string;
  password?: string;
}

class StaffService {
  /**
   * Crear un nuevo miembro del staff
   */
  public async create(data: CreateStaffPayload) {
    try {
      return await postFetcher(`${STAFF_BASE_URL}/users`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un miembro del staff
   */
  public async update(id: number, data: UpdateStaffPayload) {
    try {
      return await patchFetcher(`${STAFF_BASE_URL}/users/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Desactivar (soft delete) un miembro del staff
   */
  public async delete(id: number) {
    try {
      return await deleteFetcher(`${STAFF_BASE_URL}/users/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los miembros del staff (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${STAFF_BASE_URL}/users?${query}`
      : `${STAFF_BASE_URL}/users`;

    try {
      return await getFetcher(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar miembros del staff por nombre o DPI
   */
  public async search(params: {
    q: string;
    role?: "operador" | "vendedor";
    page?: number;
    per_page?: number;
  }) {
    const query = new URLSearchParams({
      q: params.q,
      page: String(params.page || 1),
      per_page: String(params.per_page || 10),
      ...(params.role && { role: params.role }),
    }).toString();

    try {
      return await getFetcher(`${STAFF_BASE_URL}/users/search?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un miembro del staff por ID
   */
  public async getById(id: number) {
    try {
      const res = await getFetcher(`${STAFF_BASE_URL}/users/${id}`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los vendedores activos
   */
  public async getAllSellers() {
    try {
      return await getFetcher(`${STAFF_BASE_URL}/sellers`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener vendedores disponibles para una fecha específica
   */
  public async getAvailableSellers(fecha: string) {
    try {
      return await getFetcher(
        `${STAFF_BASE_URL}/sellers/available?fecha=${fecha}`,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Importar staff desde Excel
   */
  public async importFromExcel(file: File) {
    try {
      const formData = new FormData();

      formData.append("file", file);

      return await postFetcher(
        `${STAFF_BASE_URL}/users/import`,
        {},
        {},
        formData,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar staff a Excel
   */
  public async exportToExcel(role?: "operador" | "vendedor") {
    try {
      const query = role ? `?role=${role}` : "";
      const blob = await getFileFetcher(
        `${STAFF_BASE_URL}/users/export/excel${query}`,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `staff_reporte.xlsx`;
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
   * Exportar staff a PDF
   */
  public async exportToPdf(role?: "operador" | "vendedor") {
    try {
      const query = role ? `?role=${role}` : "";
      const blob = await getFileFetcher(
        `${STAFF_BASE_URL}/users/export/pdf${query}`,
      );

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `staff_reporte.pdf`;
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
      const blob = await getFileFetcher(`${STAFF_BASE_URL}/users/template`);

      // Crear la descarga automáticamente
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template_staff.xlsx";
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

export default new StaffService();
