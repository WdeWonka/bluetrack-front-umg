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
import { Phone, MapPin, Calendar, Garage } from "iconoir-react";

import warehouseService from "../services/warehouse.service";

interface SeeWarehouseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: number | null;
}

export function SeeWarehouseModal({
  isOpen,
  onOpenChange,
  warehouseId,
}: SeeWarehouseModalProps) {
  const [warehouse, setWarehouse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showFullAddress, setShowFullAddress] = useState(false);

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
    if (!name) return "??";
    const words = name.trim().split(/\s+/).filter(Boolean);
    const firstInitial = words[0]?.charAt(0).toUpperCase() || "";
    const secondInitial = words[1]?.charAt(0).toUpperCase() || "";

    return firstInitial + secondInitial;
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "--------";
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "--------";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const formatPhone = (phone: string | null | undefined) => {
    if (!phone) return "--------";
    const cleaned = ("" + phone).replace(/\D/g, "");

    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    }

    return phone;
  };

  useEffect(() => {
    if (isOpen && warehouseId) {
      setLoading(true);
      setShowFullAddress(false);
      warehouseService
        .getWarehouseById(warehouseId)
        .then((res) => {
          setWarehouse(res);
        })
        .catch(() => {
          toast.error("Error al obtener datos del almacén");
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, warehouseId]);

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
                className="rounded-3xl relative z-0"
                height={150}
                src="/img/clouds_hero.png"
                width={400}
              />

              <Avatar
                showFallback
                className="z-10 w-28 h-28 bg-[#2e93d1] absolute -bottom-14 left-1/2 -translate-x-1/2 border-4 border-white text-white text-3xl font-bold shadow-lg"
                fallback={<Garage className="w-15 h-15" />}
              />
            </ModalHeader>

            <ModalBody className="px-6 py-4 pb-6">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="loader" />
                </div>
              ) : warehouse ? (
                <div className="flex flex-col items-center gap-5 pt-15">
                  {/* Nombre */}
                  <h2 className="text-2xl font-semibold text-gray-900 text-center">
                    {capitalizeName(warehouse.nombre)}
                  </h2>

                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 text-center -mt-4">
                    Almacén
                  </p>

                  {/* Información en tarjeta */}
                  <div className="w-full bg-gray-50 rounded-2xl p-5 space-y-5 mt-1">
                    {/* Teléfono */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Teléfono
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPhone(warehouse.telefono)}
                        </p>
                      </div>
                    </div>

                    {/* Dirección */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Dirección
                        </p>
                        <div className="relative">
                          <p
                            className={`text-sm font-semibold text-gray-900 ${
                              !showFullAddress
                                ? "line-clamp-2"
                                : "whitespace-normal"
                            }`}
                          >
                            {warehouse.direccion}
                          </p>
                          {warehouse.direccion &&
                            warehouse.direccion.length > 80 && (
                              <button
                                className="text-xs text-[#2e93d1] hover:text-[#2e93d1]/80 font-medium mt-1 transition-colors"
                                onClick={() =>
                                  setShowFullAddress(!showFullAddress)
                                }
                              >
                                {showFullAddress ? "Ver menos" : "Ver más"}
                              </button>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Fecha de creación */}
                    {warehouse.creado_en && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Fecha de creación
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatDate(warehouse.creado_en)}
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
