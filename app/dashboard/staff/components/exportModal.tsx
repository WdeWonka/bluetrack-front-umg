"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Table2Columns, Journal } from "iconoir-react";
import { toast } from "react-hot-toast";

import staffService from "../services/staff.service";

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  role?: "operador" | "vendedor";
}

export function ExportModal({
  isOpen,
  onOpenChange,
  role,
  onSuccess,
}: ExportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    onOpenChange(false);
    setIsExporting(true);

    const exportPromise = staffService.exportToExcel(role);

    toast.promise(
      exportPromise,
      {
        loading: "Exportando a Excel...",
        success: () => {
          setIsExporting(false);

          return "Archivo Excel descargado exitosamente";
        },
        error: (error) => {
          setIsExporting(false);
          if (error.response?.data?.statusCode) {
            const { message } = error.response.data;

            return message || "Error al exportar a Excel";
          }

          return "Error al exportar. Intenta nuevamente.";
        },
      },
      {
        success: { duration: 3000 },
        error: { duration: 4000 },
      },
    );
  };

  const handleExportPdf = async () => {
    onOpenChange(false);
    setIsExporting(true);

    const exportPromise = staffService.exportToPdf(role);

    toast.promise(
      exportPromise,
      {
        loading: "Exportando a PDF...",
        success: () => {
          setIsExporting(false);

          return "Archivo PDF descargado exitosamente";
        },
        error: (error) => {
          setIsExporting(false);
          if (error.response?.data?.statusCode) {
            const { message } = error.response.data;

            return message || "Error al exportar a PDF";
          }

          return "Error al exportar. Intenta nuevamente.";
        },
      },
      {
        success: { duration: 3000 },
        error: { duration: 4000 },
      },
    );
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      backdrop="opaque"
      classNames={{
        base: "min-w-[200px] w-full max-w-[600px] max-h-[90vh] sm:max-h-[600px] mx-4  bg-white rounded-4xl",
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
                Exportar Archivo
              </h1>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Selecciona el formato de archivo para exportar los datos.
              </p>
            </ModalHeader>

            <ModalBody className="px-6 py-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Botón Excel */}
                <button
                  className="group relative flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isExporting}
                  onClick={handleExportExcel}
                >
                  <div className="w-16 h-16 mb-3 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Table2Columns className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Excel
                  </h3>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Exportar como archivo .xlsx
                  </p>
                </button>

                {/* Botón PDF */}
                <button
                  className="group relative flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isExporting}
                  onClick={handleExportPdf}
                >
                  <div className="w-16 h-16 mb-3 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Journal className="w-8 h-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    PDF
                  </h3>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                    Exportar como archivo .pdf
                  </p>
                </button>
              </div>
            </ModalBody>

            <ModalFooter className="px-6 pb-6 pt-2">
              <Button
                className="font-medium"
                color="default"
                isDisabled={isExporting}
                variant="flat"
                onPress={handleCancel}
              >
                Cancelar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
