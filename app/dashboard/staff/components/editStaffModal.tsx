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
  Tooltip,
} from "@heroui/react";
import { Eye, EyeClosed } from "iconoir-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";

import staffService from "../services/staff.service";

import {
  EditStaffSchema,
  getEditStaffSchema,
} from "@/app/dashboard/staff/schemas/edit-staff";

interface EditStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  staffId: number | null;
}

export function EditStaffModal({
  isOpen,
  onOpenChange,
  onSuccess,
  staffId,
}: EditStaffModalProps) {
  const [dpiPart1, setDpiPart1] = useState("");
  const [dpiPart2, setDpiPart2] = useState("");
  const [dpiPart3, setDpiPart3] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentRol, setCurrentRol] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<EditStaffSchema>({
    resolver: zodResolver(getEditStaffSchema()),
    defaultValues: {
      dpi: "",
      nombre: "",
      email: "",
      password: "",
    },
  });

  // Cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen && staffId) {
      setLoading(true);
      staffService
        .getById(staffId)
        .then((staff) => {
          // Setear valores del formulario
          setValue("nombre", staff.nombre);
          setValue("email", staff.email);
          setValue("dpi", staff.dpi);
          setValue("password", "");

          // Setear rol (readonly)
          setCurrentRol(staff.rol);

          // Dividir DPI en 3 partes
          if (staff.dpi && staff.dpi.length === 13) {
            setDpiPart1(staff.dpi.slice(0, 4));
            setDpiPart2(staff.dpi.slice(4, 9));
            setDpiPart3(staff.dpi.slice(9, 13));
          }
        })
        .catch(() => {
          toast.error("Error al cargar datos del usuario");
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, staffId, setValue, onOpenChange]);

  // Actualizar DPI completo cuando cambien las partes
  useEffect(() => {
    const fullDpi = dpiPart1 + dpiPart2 + dpiPart3;

    setValue("dpi", fullDpi, {
      shouldValidate: fullDpi.length === 13,
    });
  }, [dpiPart1, dpiPart2, dpiPart3, setValue]);

  const onSubmit = async (data: EditStaffSchema) => {
    if (!staffId) {
      toast.error("ID de usuario no válido");

      return;
    }

    try {
      // Preparar payload (solo campos que cambiaron)
      const payload: any = {
        nombre: data.nombre,
        dpi: data.dpi,
        email: data.email,
      };

      // Solo incluir password si se proporcionó
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }

      const response = await staffService.update(staffId, payload);

      if (response.statusCode === 200) {
        toast.success("Usuario actualizado exitosamente");

        // Resetear form
        reset();
        setDpiPart1("");
        setDpiPart2("");
        setDpiPart3("");
        setCurrentRol("");

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

          case 404: // Not Found
            toast.error("Usuario no encontrado");
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
    setCurrentRol("");
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
                Editar usuario
              </h1>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Modifica los datos del usuario.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : (
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

                  {/* Rol - 50% on desktop (READONLY) */}
                  <div className="col-span-1">
                    <Input
                      isReadOnly
                      classNames={{
                        label:
                          "text-sm font-medium text-gray-900 dark:text-white",
                        inputWrapper: [
                          "bg-gray-100 backdrop-blur-sm border border-gray-300",
                          "cursor-not-allowed",
                          "rounded-xl h-[50px]",
                        ],
                        input: "text-gray-600 text-[14px] cursor-not-allowed",
                      }}
                      label="Rol - No editable"
                      labelPlacement="outside"
                      value={
                        currentRol
                          ? currentRol.charAt(0).toUpperCase() +
                            currentRol.slice(1)
                          : ""
                      }
                      variant="bordered"
                    />
                  </div>

                  {/* Email - Full Width */}
                  <div className="col-span-1">
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

                  {/* Password - Full Width (OPCIONAL) */}
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
                            showPassword
                              ? "Ocultar contraseña"
                              : "Ver contraseña"
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
                                className=" sm:h-5 sm:w-5"
                                height={15}
                                width={15}
                              />
                            ) : (
                              <EyeClosed
                                className=" sm:h-5 sm:w-5"
                                height={15}
                                width={15}
                              />
                            )}
                          </Button>
                        </Tooltip>
                      }
                      errorMessage={errors.password?.message}
                      isInvalid={!!errors.password}
                      label="Nueva Contraseña (opcional)"
                      labelPlacement="outside"
                      placeholder="Dejar vacío para no cambiar"
                      size="lg"
                      type={showPassword ? "text" : "password"}
                      variant="bordered"
                    />
                  </div>
                </form>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                isDisabled={isSubmitting || loading}
                variant="flat"
                onPress={handleClose}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium bg-[#2e93d1] hover:bg-[#2e93d1]/90"
                color="primary"
                isDisabled={loading}
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Actualizando..." : "Guardar cambios"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
