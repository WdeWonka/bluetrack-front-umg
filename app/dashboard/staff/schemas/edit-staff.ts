import { z } from "zod";

export const getEditStaffSchema = () =>
  z.object({
    dpi: z
      .string()
      .length(13, "El DPI debe tener exactamente 13 dígitos")
      .regex(/^\d+$/, "El DPI debe contener solo números"),
    nombre: z
      .string()
      .min(3, "El nombre debe tener al menos 3 caracteres")
      .max(100, "El nombre no puede exceder 100 caracteres"),
    email: z
      .string()
      .email("Email inválido")
      .max(100, "El email no puede exceder 100 caracteres"),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
      .regex(/\d/, "Debe contener al menos un número")
      .optional()
      .or(z.literal("")),
  });

export type EditStaffSchema = z.infer<ReturnType<typeof getEditStaffSchema>>;
