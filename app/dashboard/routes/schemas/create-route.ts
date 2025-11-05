import { z } from "zod";

export const getCreateRouteSchema = () => {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return z.object({
    nombre: z
      .string()
      .min(1, "El nombre de la ruta es requerido")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    vendedor_id: z.number().min(1, "Debes seleccionar un vendedor"),
    almacen_id: z.number().min(1, "Debes seleccionar un almacén"),
    fecha: z
      .string()
      .min(1, "La fecha es requerida")
      .refine(
        (dateString) => {
          const selectedDate = new Date(dateString + "T00:00:00");

          return selectedDate >= today;
        },
        {
          message: "No se pueden seleccionar fechas pasadas",
        },
      ),
  });
};

export type CreateRouteSchema = z.infer<
  ReturnType<typeof getCreateRouteSchema>
>;
