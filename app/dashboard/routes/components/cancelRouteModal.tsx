"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Textarea,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";

import routeService from "../services/route.service";

import {
  getCancelRouteSchema,
  CancelRouteSchema,
} from "@/app/dashboard/routes/schemas/cancel-route";

interface CancelRouteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: number | null;
  onSuccess?: () => void;
}

export function CancelRouteModal({
  isOpen,
  onOpenChange,
  routeId,
  onSuccess,
}: CancelRouteModalProps) {
  const [route, setRoute] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CancelRouteSchema>({
    resolver: zodResolver(getCancelRouteSchema()),
    defaultValues: {
      motivo: "",
    },
  });

  function capitalizeName(name: string | null | undefined): string {
    if (!name) return "";

    return name
      .trim()
      .split(/\s+/)
      .map((word) => {
        if (word.length === 0) return word;

        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(" ");
  }

  useEffect(() => {
    if (isOpen && routeId) {
      setLoading(true);
      reset(); // Limpiar formulario al abrir

      routeService
        .getById(routeId)
        .then((res) => {
          setRoute(res);
        })
        .catch((err) => {
          toast.error("Error al obtener datos de la ruta");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, routeId, reset]);

  const onSubmit = async (data: CancelRouteSchema) => {
    if (!routeId) return;

    try {
      const response = await routeService.cancelRoute(routeId, data.motivo);

      if (response.statusCode === 200) {
        toast.success("Ruta cancelada exitosamente");
        reset();
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      if (error.response?.data?.statusCode) {
        const { error: errorMessage } = error.response.data;

        if (errorMessage?.includes("PENDIENTE")) {
          toast.error("Solo se pueden cancelar rutas en estado PENDIENTE");
        } else if (errorMessage?.includes("no existe")) {
          toast.error("La ruta no existe");
        } else {
          toast.error(errorMessage || "Error al cancelar la ruta");
        }
      } else {
        toast.error("Error al cancelar la ruta");
      }
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[500px] bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      size="lg"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900">Cancelar Ruta</h1>
              <p className="text-sm font-normal text-gray-600">
                Estás a punto de cancelar una ruta
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : route ? (
                <form className="flex flex-col gap-5">
                  {/* Icono de advertencia */}
                  <div className="flex items-center justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Mensaje de confirmación */}
                  <div className="text-center">
                    <p className="text-base text-gray-800">
                      ¿Seguro que deseas cancelar la ruta{" "}
                      <span className="font-semibold">
                        {capitalizeName(route.nombre)}
                      </span>
                      ?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      El stock será devuelto al almacén y las órdenes quedarán
                      disponibles.
                    </p>
                  </div>

                  {/* Campo de motivo con validación */}
                  <div className="w-full">
                    <Textarea
                      {...register("motivo")}
                      isRequired
                      classNames={{
                        input: "resize-none",
                        label: "text-sm font-medium text-gray-900",
                        inputWrapper: [
                          "bg-white/60 backdrop-blur-sm border border-gray-300",
                          "hover:bg-white/80 hover:border-white/60",
                          "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                          "group-data-[focus=true]:shadow-lg group-data-[focus=true]:shadow-[#040444]/10",
                          "transition-all duration-200",
                          "rounded-xl",
                        ],
                      }}
                      description="Mínimo 5 caracteres"
                      errorMessage={errors.motivo?.message}
                      isInvalid={!!errors.motivo}
                      label="Motivo de cancelación"
                      maxRows={5}
                      minRows={3}
                      placeholder="Ej: Vendedor enfermo, condiciones climáticas adversas, vehículo averiado..."
                      variant="bordered"
                    />
                  </div>
                </form>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información de la ruta
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 gap-3">
              <Button
                className="font-medium "
                color="default"
                isDisabled={isSubmitting}
                variant="flat"
                onPress={handleClose}
              >
                Cerrar
              </Button>
              <Button
                className="font-medium  "
                color="danger"
                isDisabled={!route || loading}
                isLoading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Cancelando..." : "Confirmar Cancelación"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
