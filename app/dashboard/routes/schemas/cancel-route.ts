import { z } from "zod";

export const getCancelRouteSchema = () => {
  return z.object({
    motivo: z
      .string()
      .min(1, "El motivo es obligatorio")
      .min(5, "El motivo debe tener al menos 5 caracteres")
      .max(500, "El motivo no puede exceder 500 caracteres")
      .trim()
      .refine((val) => val.length >= 5, {
        message: "El motivo debe tener al menos 5 caracteres",
      }),
  });
};

export type CancelRouteSchema = z.infer<
  ReturnType<typeof getCancelRouteSchema>
>;
