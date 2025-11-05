import { z } from "zod";

export const getCreateWarehouseSchema = () =>
  z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    telefono: z.string().regex(/^\d{8}$/, "El teléfono debe tener 8 dígitos"),
    direccion: z.string().min(1, "La dirección es requerida"),
    latitud: z.number(),
    longitud: z.number(),
  });

export type CreateWarehouseSchema = z.infer<
  ReturnType<typeof getCreateWarehouseSchema>
>;
