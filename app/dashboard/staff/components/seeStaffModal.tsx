"use client";

import {
  Modal,
  ModalBody,
  ModalHeader,
  ModalContent,
  ModalFooter,
  Button,
  Avatar,
  Image,
} from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import staffService from "../services/staff.service";

interface SeeStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  staffId: number | null;
}

export function SeeStaffModal({
  isOpen,
  onOpenChange,
  staffId,
}: SeeStaffModalProps) {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(false);

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

  function getInitials(name: string | null | undefined): string {
    if (!name) return "";

    // Separar por espacios y filtrar palabras vacías
    const words = name.trim().split(/\s+/).filter(Boolean);

    // Tomar la primera letra del primer y segundo nombre
    const firstInitial = words[0]?.charAt(0).toUpperCase() || "";
    const secondInitial = words[1]?.charAt(0).toUpperCase() || "";

    return firstInitial + secondInitial;
  }

  const formatDate = (dateString: string, isCreatedAt?: boolean) => {
    if (!dateString) return "--------";
    if (isCreatedAt) {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return "--------";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    }

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;
  };

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

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[420px] max-h-auto bg-white rounded-3xl",
      }}
      hideCloseButton={true}
      isOpen={isOpen}
      placement="center"
      size="sm"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader
              className={`flex flex-col gap-1 p-2 pb-0 items-center relative
              ${loading ? "hidden" : "flex"}`}
            >
              <Image
                alt="clouds hero"
                className="rounded-3xl relative z-0 "
                height={150}
                src="/img/clouds_hero.png"
                width={400}
              />

              <Avatar
                showFallback
                className="z-10 w-28 h-28 bg-[#2e93d1] absolute -bottom-14 left-1/2 -translate-x-1/2 border-4 border-white text-white text-3xl font-bold shadow-lg"
                fallback={getInitials(staff?.nombre)}
              />
            </ModalHeader>

            <ModalBody className="px-6 py-4 pb-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : staff ? (
                <div className="flex flex-col items-center gap-5 pt-15">
                  {/* Nombre */}
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    {capitalizeName(staff.nombre)}
                  </h2>

                  {/* Rol - Descripción estilo subtitle */}
                  <p className="text-sm text-gray-500 text-center -mt-4">
                    {staff.rol?.charAt(0).toUpperCase() + staff.rol?.slice(1) ||
                      "Sin rol asignado"}
                  </p>

                  {/* Información en tarjeta con fondo suave */}
                  <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-5 mt-1">
                    {/* DPI */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          DPI
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {staff.dpi}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Correo
                        </p>
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {staff.email}
                        </p>
                      </div>
                    </div>

                    {/* Fecha de creación */}
                    {staff.creado_en && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                            />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Fecha de creación
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(staff.creado_en, true)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-10">
                  No se encontró información.
                </p>
              )}
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="w-full rounded-xl font-medium h-12 bg-[#2e93d1] text-white hover:bg-[#2e93d1]/90 transition-colors"
                variant="shadow"
                onPress={() => onOpenChange(false)}
              >
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
