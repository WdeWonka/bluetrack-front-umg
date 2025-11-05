"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Eye, EyeClosed } from "iconoir-react";
import Image from "next/image";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

import authService from "./services/auth.service";

import { ROLES } from "@/shared/constants/roles.constant";
import {
  DASHBOARD_PATH,
  SELLER_ROUTES_PATH,
} from "@/shared/config/paths.config";
import { getLoginSchema, LoginSchema } from "@/app/login/schemas/login";
import logo_bluestack from "@/public/img/logo_bluestack.png";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<LoginSchema>({
    resolver: zodResolver(getLoginSchema()),
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginSchema) => {
    const isValid = await trigger();

    if (!isValid) return;

    try {
      setLoading(true);

      const response = await authService.login(data.email, data.password);

      if (response.statusCode === 200) {
        toast.success("Inicio de sesión exitoso");

        // ✅ IMPORTANTE: Obtener el rol desde la respuesta del backend
        const userRole = response.user?.rol;

        console.log("User role from backend:", userRole);

        // ✅ Redirigir según el rol recibido
        // El middleware se encargará de validar y el UserProvider se actualizará automáticamente
        if (userRole === ROLES.SELLER) {
          router.push(SELLER_ROUTES_PATH);
        } else {
          router.push(DASHBOARD_PATH);
        }

        // Forzar refresh para que el middleware y el provider se actualicen
        router.refresh();
      } else if (response.statusCode === 401) {
        toast.error("Credenciales inválidas. Por favor, inténtalo de nuevo.");
      } else {
        toast.error("Ocurrió un error inesperado.");
      }
    } catch {
      toast.error("Error del servidor. Por favor, inténtalo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldBlur = async (fieldName: keyof LoginSchema) => {
    await trigger(fieldName);
  };

  return (
    <div className="min-h-screen bg-[#C0DEED] overflow-hidden flex items-center justify-center p-4">
      <div className="clouds min-h-screen" />

      {/* Contenedor con glassmorphism */}
      <div className="relative z-10 w-full max-w-[420px]">
        <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20  backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Image
                alt="Logo"
                className="w-9 h-14 object-contain"
                src={logo_bluestack}
              />
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl font-bold text-[#040444] text-center mb-2">
            Bienvenido
          </h1>

          {/* Subtítulo */}
          <p className="text-[#040444]/80 text-center mb-8 text-[14px]">
            Ingresa tus credenciales para continuar
          </p>

          {/* Formulario */}
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Email */}
            <div>
              <Input
                {...register("email")}
                classNames={{
                  base: "w-full",
                  inputWrapper: [
                    "bg-white/60 backdrop-blur-sm border border-white/40",
                    "hover:bg-white/80 hover:border-white/60",
                    "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF] group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                    "transition-all duration-200",
                    "rounded-xl h-[50px]",
                    errors.email ? "border-red-400 bg-red-50/60" : "",
                  ],
                  label: "text-[#040444] font-semibold text-[13px] mb-2 ml-0.5",
                  input:
                    "text-[#040444] placeholder:text-[#040444]/30 text-[14px]",
                }}
                errorMessage={errors.email?.message}
                isDisabled={isLoading}
                isInvalid={!!errors.email}
                label="Correo electrónico"
                labelPlacement="outside"
                placeholder="tu@email.com"
                size="lg"
                type="email"
                variant="flat"
                onBlur={() => handleFieldBlur("email")}
              />
            </div>

            {/* Password */}
            <div>
              <Input
                {...register("password")}
                classNames={{
                  base: "w-full",
                  inputWrapper: [
                    "bg-white/60 backdrop-blur-sm border border-white/40",
                    "hover:bg-white/80 hover:border-white/60",
                    "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF] group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                    "transition-all duration-200",
                    "rounded-xl h-[50px]",
                    errors.password ? "border-red-400 bg-red-50/60" : "",
                  ],
                  label: "text-[#040444] font-semibold text-[13px] mb-2 ml-0.5",

                  input:
                    "text-[#040444] placeholder:text-[#040444]/30 text-[14px]",
                }}
                endContent={
                  <Tooltip
                    closeDelay={0}
                    content={
                      showPassword ? "Ocultar contraseña" : "Ver contraseña"
                    }
                    delay={0}
                  >
                    <Button
                      disableRipple
                      isIconOnly
                      className="focus:outline-none bg-transparent"
                      size="sm"
                      variant="light"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye
                          className="text-[var(--color-coolblack)] sm:h-5 sm:w-5"
                          height={18}
                          width={18}
                        />
                      ) : (
                        <EyeClosed
                          className="text-[var(--color-coolblack)] sm:h-5 sm:w-5"
                          height={18}
                          width={18}
                        />
                      )}
                    </Button>
                  </Tooltip>
                }
                errorMessage={errors.password?.message}
                isDisabled={isLoading}
                isInvalid={!!errors.password}
                label="Contraseña"
                labelPlacement="outside"
                placeholder="••••••••"
                size="lg"
                type={showPassword ? "text" : "password"}
                variant="flat"
                onBlur={() => handleFieldBlur("password")}
              />
            </div>

            {/* Botón Ingresar */}
            <Button
              className="w-full h-[52px] bg-[#040444] text-white font-bold rounded-xl text-[15px] mt-4 hover:bg-[#040444]/90 hover:shadow-xl hover:shadow-[#040444]/30 transition-all duration-200"
              disabled={isLoading}
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              {isLoading ? "Ingresando..." : "INGRESAR"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
