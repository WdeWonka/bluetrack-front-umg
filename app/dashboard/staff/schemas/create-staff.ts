import { z } from "zod";

export const getCreateStaffSchema = () =>
  z.object({
    dpi: z
      .string()
      .min(13, { message: "El dpi tiene que tener 13 numeros" })
      .max(13, { message: "El dpi tiene que tener 13 digitos" }),
    nombre: z.string().min(1, "El nombre es requerido"),
    email: z
      .string()
      .min(1, { message: "El correo electrónico es obligatorio" })
      .refine((val) => /^\S+@\S+\.\S+$/.test(val), {
        message: "Dirección de correo electrónico no válida",
      }),
    password: z
      .string()
      .trim()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/[A-Z]/, {
        message: "La contraseña debe contener al menos una letra mayúscula",
      })
      .regex(/\d/, {
        message: "La contraseña debe contener al menos un número",
      }),
    rol: z.enum(["operador", "vendedor"]),
  });

export type CreateStaffSchema = z.infer<
  ReturnType<typeof getCreateStaffSchema>
>;
