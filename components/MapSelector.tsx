"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Input } from "@heroui/react";
import { toast } from "react-hot-toast";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapSelectorProps {
  onLocationSelect: (data: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
}

// Componente para actualizar el centro del mapa cuando cambian las coordenadas
function MapUpdater({ position }: { position: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);

  return null;
}

export default function MapSelector({
  onLocationSelect,
  initialAddress = "",
  initialLat = 14.6349,
  initialLng = -90.5069,
}: MapSelectorProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [address, setAddress] = useState(initialAddress);

  const roundTo6 = (num: number) => parseFloat(num.toFixed(6));
  const limitText = (text: string, max: number) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // Actualizar estado cuando cambien las props iniciales
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
    if (initialLat && initialLng) {
      setPosition({ lat: initialLat, lng: initialLng });
    }
  }, [initialAddress, initialLat, initialLng]);

  // Buscar dirección manualmente (por texto)
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&countrycodes=GT&accept-language=es`,
      );
      const data = await res.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        const cleanAddress = limitText(display_name, 255);

        setPosition(newPos);
        setAddress(cleanAddress);

        onLocationSelect({
          address: cleanAddress,
          lat: roundTo6(newPos.lat),
          lng: roundTo6(newPos.lng),
        });
      } else {
        toast.error(
          "No se encontraron resultados para la dirección ingresada.",
        );
      }
    } catch (err) {
      console.error("Error en búsqueda:", err);
    }
  };

  // Obtener dirección al hacer click en el mapa
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`,
      );
      const data = await res.json();

      if (data?.display_name) {
        const cleanAddress = limitText(data.display_name, 255);

        setAddress(cleanAddress);
        onLocationSelect({
          address: cleanAddress,
          lat: roundTo6(lat),
          lng: roundTo6(lng),
        });
      }
    } catch (err) {
      console.error("Error al obtener dirección:", err);
    }
  };

  // Captura clics en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };

        setPosition(newPos);
        reverseGeocode(newPos.lat, newPos.lng);
      },
    });

    return null;
  };

  // Llamada inicial solo si NO hay valores iniciales
  useEffect(() => {
    if (!initialAddress && !initialLat && !initialLng) {
      onLocationSelect({
        address,
        lat: roundTo6(position.lat),
        lng: roundTo6(position.lng),
      });
    }
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <Input
        isRequired
        classNames={{
          label: "text-sm font-medium text-gray-900 dark:text-white",
          inputWrapper: [
            "bg-white/60 backdrop-blur-sm border border-gray-300",
            "hover:bg-white/80 hover:border-white/60",
            "group-data-[focus=true]:bg-white/90 group-data-[focus=true]:border-[#769AFF]",
            "transition-all duration-200",
            "rounded-xl h-[50px]",
          ],
          input: "text-[#040444] placeholder:text-[#040444]/50 text-[14px]",
        }}
        label="Buscar dirección"
        labelPlacement="outside"
        placeholder="Ej. Mixco, Ciudad de Guatemala"
        value={address}
        variant="bordered"
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter")
            handleSearch((e.target as HTMLInputElement).value);
        }}
      />

      <div className="w-full h-[300px] rounded-lg overflow-hidden shadow">
        <MapContainer
          center={position}
          style={{ height: "100%", width: "100%" }}
          zoom={14}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker icon={markerIcon} position={position} />
          <MapClickHandler />
          <MapUpdater position={position} />
        </MapContainer>
      </div>
    </div>
  );
}
