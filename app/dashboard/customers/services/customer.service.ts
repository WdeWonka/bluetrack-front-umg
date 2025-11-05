import {
  getFetcher,
  postFetcher,
  patchFetcher,
  getFileFetcher,
} from "@/shared/utils/fetcher";
import { CUSTOMERS_BASE_URL } from "@/shared/config/endpoints.config";

export interface CreateCustomerPayload {
  nombre: string;
  direccion: string;
  telefono: string;
  latitud: number;
  longitud: number;
}

export interface UpdateCustomerPayload {
  nombre?: string;
  direccion?: string;
  telefono?: string;
  latitud?: number;
  longitud?: number;
}

class CustomerService {
  /**
   * Crear un nuevo cliente
   */
  public async create(data: CreateCustomerPayload) {
    try {
      return await postFetcher(`${CUSTOMERS_BASE_URL}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualizar un cliente
   */
  public async update(id: number, data: UpdateCustomerPayload) {
    try {
      return await patchFetcher(`${CUSTOMERS_BASE_URL}/${id}`, data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener todos los clientes (paginado)
   */
  public async getAll(params: Record<string, any> = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${CUSTOMERS_BASE_URL}?${query}`
      : `${CUSTOMERS_BASE_URL}`;

    try {
      return await getFetcher(url);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Buscar clientes por nombre o dirección
   */
  public async search(params: { q: string; page?: number; per_page?: number }) {
    const query = new URLSearchParams({
      q: params.q,
      page: String(params.page || 1),
      per_page: String(params.per_page || 10),
    }).toString();

    try {
      return await getFetcher(`${CUSTOMERS_BASE_URL}/search?${query}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener un cliente por ID
   */
  public async getCustomerById(id: number) {
    try {
      const res = await getFetcher(`${CUSTOMERS_BASE_URL}/${id}`);

      return res.response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Importar clientes desde Excel
   */
  public async importFromExcel(file: File) {
    try {
      const formData = new FormData();

      formData.append("file", file);

      return await postFetcher(
        `${CUSTOMERS_BASE_URL}/import`,
        {},
        {},
        formData,
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exportar clientes a Excel
   */
  public async exportToExcel() {
    try {
      const blob = await getFileFetcher(`${CUSTOMERS_BASE_URL}/export/excel`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `clientes.xlsx`;
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
   * Exportar clientes a PDF
   */
  public async exportToPdf() {
    try {
      const blob = await getFileFetcher(`${CUSTOMERS_BASE_URL}/export/pdf`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `reporte_clientes.pdf`;
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
      const blob = await getFileFetcher(`${CUSTOMERS_BASE_URL}/template`);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "template_clientes.xlsx";
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

export default new CustomerService();
