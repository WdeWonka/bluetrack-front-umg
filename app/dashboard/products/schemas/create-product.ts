import { z } from "zod";

export const getCreateProductSchema = () =>
  z.object({
    nombre: z
      .string()
      .min(1, "El nombre es requerido")
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres")
      .trim(),

    precio: z
      .number()
      .positive("El precio debe ser mayor a 0")
      .max(999999.99, "El precio no puede exceder Q999,999.99"),

    stock_total: z
      .number()
      .int("El stock debe ser un número entero")
      .min(0, "El stock no puede ser negativo")
      .max(50000, "El stock no puede exceder 50,000 unidades"),
  });

export type CreateProductSchema = z.infer<
  ReturnType<typeof getCreateProductSchema>
>;
