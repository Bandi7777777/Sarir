// packages/frontend/src/app/vehicles/list/VehiclesMapClient.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */ // TODO: refine vehicle map types

/**
 * فقط در کلاینت اجرا می‌شود.
 * - ensureLeafletIcons: لود تنبل leaflet + CSS + آیکون‌ها
 * - نقشه با z-0 رندر می‌شود تا روی عناصر دیگر ننشیند
 */

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import ensureLeafletIcons from "@/lib/leaflet-fix";

const MapContainerAny = MapContainer as any;
const TileLayerAny = TileLayer as any;
const MarkerAny = Marker as any;
const PopupAny = Popup as any;
const MarkerClusterGroupAny = MarkerClusterGroup as any;

type LatLngExpression = [number, number];

type VehicleMarker = {
  id: string | number;
  title: string;
  position: LatLngExpression; // [lat, lng]
  description?: string;
};

type Props = {
  markers?: VehicleMarker[];
  center: LatLngExpression;
  zoom: number;
  useCluster?: boolean;
};

export default function VehiclesMapClient({
  markers,
  center,
  zoom,
  useCluster = true,
}: Props) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    ensureLeafletIcons();
    setReady(true);
  }, []);

  const data: VehicleMarker[] = useMemo(
    () =>
      markers && markers.length
        ? markers
        : [
            { id: 1, title: "Truck #A12", position: [35.72, 51.42], description: "Active" },
            { id: 2, title: "Wagon #W07", position: [32.65, 51.67], description: "Idle" },
            { id: 3, title: "Loco #L90", position: [29.62, 52.53], description: "En-route" },
          ],
    [markers]
  );

  if (!ready) {
    return (
      <div className="relative z-0 w-full h-[70vh] rounded-2xl overflow-hidden border grid place-items-center">
        <div className="text-sm text-gray-600">در حال آماده‌سازی نقشه…</div>
      </div>
    );
  }

  const markersEl = data.map((m) => (
    <MarkerAny key={m.id} position={m.position}>
      <PopupAny>
        <div className="text-sm">
          <div className="font-semibold">{m.title}</div>
          {m.description ? <div className="text-muted-foreground">{m.description}</div> : null}
        </div>
      </PopupAny>
    </MarkerAny>
  ));

  return (
    <div className="relative z-0 w-full h-[70vh] rounded-2xl overflow-hidden border">
      <MapContainerAny
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayerAny
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {useCluster ? <MarkerClusterGroupAny>{markersEl}</MarkerClusterGroupAny> : markersEl}
      </MapContainerAny>
    </div>
  );
}


