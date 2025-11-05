import { z } from "zod";
export const getLoginSchema = () =>
  z.object({
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
        message: "La contraseña d  n    ebe contener al menos un número",
      }),
  });

export type LoginSchema = z.infer<ReturnType<typeof getLoginSchema>>;
