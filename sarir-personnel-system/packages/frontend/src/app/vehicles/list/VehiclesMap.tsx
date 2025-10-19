// packages/frontend/src/app/vehicles/list/VehiclesMap.tsx
"use client";

import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";

type VehicleMarker = {
  id: string | number;
  title: string;
  position: LatLngExpression;
  description?: string;
};

type Props = {
  markers?: VehicleMarker[];
  center?: LatLngExpression;
  zoom?: number;
  useCluster?: boolean;
};

const DEFAULT_CENTER: LatLngExpression = [35.6892, 51.3890];
const DEFAULT_ZOOM = 6;

const VehiclesMapClient = dynamic(() => import("./VehiclesMapClient"), {
  ssr: false,
  loading: () => (
    <div className="relative z-0 w-full h-[70vh] rounded-2xl overflow-hidden border grid place-items-center">
      <div className="text-sm text-gray-600">در حال بارگذاری نقشه…</div>
    </div>
  ),
});

export default function VehiclesMap({
  markers,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  useCluster = true,
}: Props) {
  return (
    <VehiclesMapClient
      markers={markers}
      center={center}
      zoom={zoom}
      useCluster={useCluster}
    />
  );
}
