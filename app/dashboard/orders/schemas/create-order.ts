import { z } from "zod";

export const getCreateOrderSchema = () => {
  return z.object({
    cliente_id: z
      .number()
      .int("El ID debe ser un número entero")
      .positive("Debe seleccionar un cliente válido"),

    producto_id: z
      .number()
      .int("El ID debe ser un número entero")
      .positive("Debe seleccionar un producto válido"),

    cantidad: z
      .number()
      .int("La cantidad debe ser un número entero")
      .positive("La cantidad debe ser mayor a 0")
      .max(1000, "La cantidad no puede exceder 1000 unidades"),

    fecha_solicitud: z
      .string()
      .min(1, "La fecha de entrega es obligatoria")
      .refine(
        (val) => {
          // Validar formato YYYY-MM-DD (que es el que devuelve DateInput)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

          return dateRegex.test(val);
        },
        {
          message: "Formato de fecha inválido",
        },
      ),
  });
};

export type CreateOrderSchema = z.infer<
  ReturnType<typeof getCreateOrderSchema>
>;
