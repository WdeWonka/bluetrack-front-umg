"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Input,
  Button,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useState, useEffect, useMemo } from "react";

import warehouseService from "../services/warehouse.service";

import MapSelector from "@/components/MapSelector";
import {
  CreateWarehouseSchema as EditWarehouseSchema,
  getCreateWarehouseSchema as getEditWarehouseSchema,
} from "@/app/dashboard/warehouses/schemas/create-warehouse";

interface EditWarehouseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  warehouseId: number | null;
}

export function EditWarehouseModal({
  isOpen,
  onOpenChange,
  onSuccess,
  warehouseId,
}: EditWarehouseModalProps) {
  const [loading, setLoading] = useState(false);
  const [initialMapData, setInitialMapData] = useState({
    address: "",
    lat: 14.6349,
    lng: -90.5069,
  });
  const [initialData, setInitialData] = useState<EditWarehouseSchema>({
    nombre: "",
    telefono: "",
    direccion: "",
    latitud: 0,
    longitud: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EditWarehouseSchema>({
    resolver: zodResolver(getEditWarehouseSchema()),
    defaultValues: {
      nombre: "",
      telefono: "",
      direccion: "",
      latitud: 0,
      longitud: 0,
    },
  });

  const nombre = watch("nombre");
  const telefono = watch("telefono");
  const direccion = watch("direccion");
  const latitud = watch("latitud");
  const longitud = watch("longitud");

  // Verificar si hay cambios
  const hasChanges = useMemo(() => {
    return (
      nombre !== initialData.nombre ||
      telefono !== initialData.telefono ||
      direccion !== initialData.direccion ||
      latitud !== initialData.latitud ||
      longitud !== initialData.longitud
    );
  }, [nombre, telefono, direccion, latitud, longitud, initialData]);

  // Cargar datos del almacén cuando se abre el modal
  useEffect(() => {
    if (isOpen && warehouseId) {
      setLoading(true);
      warehouseService
        .getWarehouseById(warehouseId)
        .then((warehouse) => {
          const warehouseData = {
            nombre: warehouse.nombre,
            telefono: warehouse.telefono,
            direccion: warehouse.direccion,
            latitud: warehouse.latitud,
            longitud: warehouse.longitud,
          };

          // Guardar datos iniciales
          setInitialData(warehouseData);

          // Establecer valores en el formulario
          setValue("nombre", warehouse.nombre);
          setValue("telefono", warehouse.telefono);
          setValue("direccion", warehouse.direccion);
          setValue("latitud", warehouse.latitud);
          setValue("longitud", warehouse.longitud);

          // Establecer datos iniciales del mapa
          setInitialMapData({
            address: warehouse.direccion,
            lat: warehouse.latitud,
            lng: warehouse.longitud,
          });
        })
        .catch(() => {
          toast.error("Error al cargar datos del almacén");
          onOpenChange(false);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, warehouseId, setValue, onOpenChange]);

  const onSubmit = async (data: EditWarehouseSchema) => {
    if (!warehouseId) {
      toast.error("ID de almacén no válido");

      return;
    }

    if (!data.direccion || !data.latitud || !data.longitud) {
      toast.error("Por favor selecciona una ubicación en el mapa.");

      return;
    }

    try {
      const response = await warehouseService.update(warehouseId, {
        nombre: data.nombre,
        telefono: data.telefono,
        direccion: data.direccion,
        latitud: data.latitud,
        longitud: data.longitud,
      });

      switch (response.statusCode) {
        case 200:
          toast.success("Almacén actualizado exitosamente");
          onSuccess();
          handleClose();
          break;

        case 404:
          toast.error(`El almacén con ID ${warehouseId} no existe`);
          break;

        case 422:
          toast.error("Error de validación en los datos");
          break;

        case 409:
          toast.error("Hay datos dupicados ");
          break;

        case 400:
          toast.error("Datos inválidos. Verifica la información.");
          break;

        case 500:
          toast.error("Error del servidor. Intenta nuevamente.");
          break;

        default:
          toast.error("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error al actualizar almacén:", error);
      toast.error("Ocurrió un error inesperado. Intenta nuevamente.");
    }
  };

  const handleClose = () => {
    reset();
    setInitialMapData({
      address: "",
      lat: 14.6349,
      lng: -90.5069,
    });
    setInitialData({
      nombre: "",
      telefono: "",
      direccion: "",
      latitud: 0,
      longitud: 0,
    });
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
              <h1 className="text-xl font-bold text-gray-900">
                Editar Almacén
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Modifica los datos del almacén.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : (
                <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombre */}
                  <Input
                    {...register("nombre")}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      inputWrapper: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
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

                  {/* Teléfono */}
                  <Input
                    {...register("telefono")}
                    isRequired
                    classNames={{
                      label:
                        "text-sm font-medium text-gray-900 dark:text-white",
                      inputWrapper: [
                        "bg-white/60 backdrop-blur-sm border border-gray-300",
                        "hover:bg-white/80 hover:border-white/60",
                        "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
                        "transition-all duration-200",
                        "rounded-xl h-[50px]",
                      ],
                      input:
                        "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
                    }}
                    errorMessage={errors.telefono?.message}
                    isInvalid={!!errors.telefono}
                    label="Teléfono"
                    labelPlacement="outside"
                    placeholder="Ej: 12345678"
                    variant="bordered"
                  />

                  {/* Mapa */}
                  <div className="col-span-1 sm:col-span-2">
                    <MapSelector
                      initialAddress={initialMapData.address}
                      initialLat={initialMapData.lat}
                      initialLng={initialMapData.lng}
                      onLocationSelect={({ address, lat, lng }) => {
                        setValue("direccion", address, {
                          shouldValidate: true,
                        });
                        setValue("latitud", lat, { shouldValidate: true });
                        setValue("longitud", lng, { shouldValidate: true });
                      }}
                    />
                    {errors.direccion && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.direccion.message}
                      </p>
                    )}

                    {direccion && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Dirección: {direccion}
                      </p>
                    )}
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
                isDisabled={loading || isSubmitting || !hasChanges}
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
