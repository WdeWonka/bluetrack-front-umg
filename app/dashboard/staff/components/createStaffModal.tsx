"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
  InputOtp,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { Eye, EyeClosed } from "iconoir-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";

import staffService from "../services/staff.service";

import {
  getCreateStaffSchema,
  CreateStaffSchema,
} from "@/app/dashboard/staff/schemas/create-staff";

interface CreateStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateStaffModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateStaffModalProps) {
  const [dpiPart1, setDpiPart1] = useState("");
  const [dpiPart2, setDpiPart2] = useState("");
  const [dpiPart3, setDpiPart3] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CreateStaffSchema>({
    resolver: zodResolver(getCreateStaffSchema()),
    defaultValues: {
      dpi: "",
      nombre: "",
      email: "",
      password: "",
      rol: "operador",
    },
  });

  useEffect(() => {
    const fullDpi = dpiPart1 + dpiPart2 + dpiPart3;

    setValue("dpi", fullDpi, {
      shouldValidate: fullDpi.length === 13,
    });
  }, [dpiPart1, dpiPart2, dpiPart3, setValue]);

  const onSubmit = async (data: CreateStaffSchema) => {
    try {
      const response = await staffService.create(data);

      if (response.statusCode === 201) {
        toast.success("Usuario creado exitosamente");

        // Resetear form y DPI parts
        reset();
        setDpiPart1("");
        setDpiPart2("");
        setDpiPart3("");

        onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      if (error.response?.data?.statusCode) {
        const { statusCode, error: errorMessage } = error.response.data;

        switch (statusCode) {
          case 422: // Unprocessable Entity - Validación de password
            toast.error(errorMessage || "Error de validación en los datos");
            break;

          case 409: // Conflict - Usuario duplicado (email o DPI)
            toast.error(
              errorMessage || "El usuario ya existe (email o DPI duplicado)",
            );
            break;

          case 400: // Bad Request
            toast.error(
              errorMessage || "Datos inválidos. Verifica la información.",
            );
            break;

          case 500: // Internal Server Error
            toast.error("Error del servidor. Intenta nuevamente.");
            break;

          default:
            toast.error("Error inesperado. Intenta nuevamente.");
        }
      } else {
        // Error de red o sin respuesta del servidor
        toast.error("Error de conexión. Verifica tu conexión a internet.");
      }
    }
  };

  const handleClose = () => {
    reset();
    setDpiPart1("");
    setDpiPart2("");
    setDpiPart3("");
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[660px] max-h-[90vh] sm:max-h-[600px] mx-3 bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Agregar nuevo usuario
              </h1>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Llena los campos para crear un nuevo usuario.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DPI Section - Full Width */}
                <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    DPI <span className="text-red-500">*</span>
                  </p>
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 items-center justify-center">
                    <InputOtp
                      classNames={{
                        segmentWrapper: "gap-x-0",
                        segment: [
                          "relative",
                          "h-10",
                          "w-9",
                          "sm:h-10",
                          "sm:w-10",
                          "border border-gray-300",
                          "first:rounded-l-md",
                          "first:border-l",
                          "last:rounded-r-md",
                          "text-sm",
                          "font-medium",
                          "bg-white/60",
                        ],
                      }}
                      description="Primera parte"
                      length={4}
                      radius="none"
                      type="number"
                      value={dpiPart1}
                      onValueChange={setDpiPart1}
                    />

                    <InputOtp
                      classNames={{
                        segmentWrapper: "gap-x-0",
                        segment: [
                          "relative",
                          "h-10",
                          "w-9",
                          "sm:h-10",
                          "sm:w-10",
                          "border border-gray-300",
                          "first:rounded-l-md",
                          "first:border-l",
                          "last:rounded-r-md",
                          "text-sm",
                          "font-medium",
                          "bg-white/60",
                        ],
                      }}
                      description="Segunda parte"
                      length={5}
                      radius="none"
                      type="number"
                      value={dpiPart2}
                      onValueChange={setDpiPart2}
                    />

                    <InputOtp
                      classNames={{
                        segmentWrapper: "gap-x-0",
                        segment: [
                          "relative",
                          "h-10",
                          "w-9",
                          "sm:h-10",
                          "sm:w-10",
                          "border border-gray-300",
                          "first:rounded-l-md",
                          "first:border-l",
                          "last:rounded-r-md",
                          "text-sm",
                          "font-medium",
                          "bg-white/60",
                        ],
                      }}
                      description="Tercera parte"
                      length={4}
                      radius="none"
                      type="number"
                      value={dpiPart3}
                      onValueChange={setDpiPart3}
                    />
                  </div>
                  {errors.dpi && (
                    <span className="text-xs text-red-500">
                      {errors.dpi.message}
                    </span>
                  )}
                </div>

                {/* Nombre - 50% on desktop */}
                <div className="col-span-1">
                  <Input
                    {...register("nombre")}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      inputWrapper: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300 ",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                        "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                        "transition-all duration-200",
                        "rounded-xl h-[50px]",
                      ],
                      input:
                        "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
                    }}
                    errorMessage={errors.nombre?.message}
                    isInvalid={!!errors.nombre}
                    label="Nombre"
                    labelPlacement="outside"
                    placeholder="Ej: Juan Pérez"
                    variant="bordered"
                  />
                </div>

                {/* Rol - 50% on desktop */}
                <div className="col-span-1">
                  <Select
                    {...register("rol")}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      trigger: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                        "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                        "transition-all duration-200",
                        "rounded-xl h-[50px]",
                      ],
                    }}
                    defaultSelectedKeys={["operador"]}
                    label="Rol"
                    labelPlacement="outside"
                    placeholder="Selecciona un rol"
                    variant="bordered"
                  >
                    <SelectItem key="operador">Operador</SelectItem>
                    <SelectItem key="vendedor">Vendedor</SelectItem>
                  </Select>
                </div>

                {/* Email - Full Width */}
                <div className="col-span-1 ">
                  <Input
                    {...register("email")}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      inputWrapper: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300 ",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                        "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                        "transition-all duration-200",
                        "rounded-xl h-[50px]",
                      ],
                      input:
                        "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
                    }}
                    errorMessage={errors.email?.message}
                    isInvalid={!!errors.email}
                    label="Email"
                    labelPlacement="outside"
                    placeholder="ejemplo@correo.com"
                    type="email"
                    variant="bordered"
                  />
                </div>

                {/* Password - Full Width */}
                <div className="col-span-1">
                  <Input
                    {...register("password")}
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      inputWrapper: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300 ",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                        "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                        "transition-all duration-200",
                        "rounded-xl ",
                      ],
                      input:
                        "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
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
                              height={15}
                              width={15}
                            />
                          ) : (
                            <EyeClosed
                              className="text-[var(--color-coolblack)] sm:h-5 sm:w-5"
                              height={15}
                              width={15}
                            />
                          )}
                        </Button>
                      </Tooltip>
                    }
                    errorMessage={errors.password?.message}
                    isInvalid={!!errors.password}
                    label="Contraseña"
                    labelPlacement="outside"
                    placeholder="••••••••"
                    size="lg"
                    type={showPassword ? "text" : "password"}
                    variant="bordered"
                  />
                </div>
              </form>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                isDisabled={isSubmitting}
                variant="flat"
                onPress={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium bg-[#2e93d1] hover:bg-[#2e93d1]/90 "
                color="primary"
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Creando..." : "Agregar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
