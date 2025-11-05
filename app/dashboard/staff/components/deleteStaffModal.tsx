"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import staffService from "../services/staff.service";

interface DeleteStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: number | null;
  onSuccess?: () => void;
}

export function DeleteStaffModal({
  isOpen,
  onOpenChange,
  staffId,
  onSuccess,
}: DeleteStaffModalProps) {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (isOpen && staffId) {
      setLoading(true);
      staffService
        .getById(staffId)
        .then((res) => {
          setStaff(res);
        })
        .catch((err) => {
          toast.error("Error al obtener datos del usuario");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, staffId]);

  const handleDelete = async () => {
    if (!staffId) return;

    setIsDeleting(true);
    try {
      const response = await staffService.delete(staffId);

      if (response.statusCode === 200) {
        toast.success("Usuario  eliminado exitosamente");
        onSuccess?.();
        onOpenChange(false);
      }
    } catch (error: any) {
      if (error.response?.data?.statusCode) {
        const { error: errorMessage } = error.response.data;

        if (errorMessage?.includes("ya está inactivo")) {
          toast.error("El usuario ya está inactivo");
        } else {
          toast.error(errorMessage || "Error al eliminar el usuario");
        }
      } else {
        toast.error("Error al eliminar el usuario");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[420px] bg-white rounded-4xl",
        closeButton: "top-4 right-4",
      }}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1 px-6 pt-6 pb-2">
              <h1 className="text-xl font-bold text-gray-900">
                Eliminar Usuario
              </h1>
              <p className="text-sm font-normal text-gray-600">
                Estás a punto de eliminar un usuario
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : staff ? (
                <div className="flex flex-col items-center gap-5">
                  {/* Icono de advertencia */}
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

                  {/* Mensaje de confirmación */}
                  <div className="text-center">
                    <p className="text-base text-gray-800">
                      ¿Seguro que deseas eliminar a{" "}
                      <span className="font-semibold">
                        {capitalizeName(staff.nombre)}
                      </span>
                      ?
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Esta acción es irreversible.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información del usuario
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2 gap-3">
              <Button
                className="font-medium flex-1"
                color="default"
                isDisabled={isDeleting}
                variant="flat"
                onPress={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                className="font-medium flex-1"
                color="danger"
                isDisabled={!staff || loading}
                isLoading={isDeleting}
                onPress={handleDelete}
              >
                {isDeleting ? "Eliminando..." : "Confirmar"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
