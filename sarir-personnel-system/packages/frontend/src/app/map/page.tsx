"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";

import type { ClusterPoint } from "@/components/map/ClusterLayer";
const MapContainer = dynamic<any>(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer    = dynamic<any>(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const ClusterLayer = dynamic(() => import("@/components/map/ClusterLayer"), { ssr: false });

export default function MapPage() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("leaflet-defaulticon-compatibility");
      import("leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css");
    }
  }, []);

  const points = useMemo<ClusterPoint[]>(() => ([
    { id: 1, position: [35.6892, 51.3890], title: "Tehran" },
    { id: 2, position: [32.6539, 51.6660], title: "Isfahan" },
    { id: 3, position: [29.5918, 52.5837], title: "Shiraz" },
    { id: 4, position: [36.2605, 59.6168], title: "Mashhad" },
    { id: 5, position: [31.3183, 48.6706], title: "Ahvaz" }
  ]), []);

  return (
    <div className="h-[calc(100vh-120px)] p-4">
      <div className="card h-full overflow-hidden">
        <MapContainer center={[32.65, 51.67]} zoom={6} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClusterLayer points={points} />
        </MapContainer>
      </div>
    </div>
  );
}
