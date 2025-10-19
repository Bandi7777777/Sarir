// packages/frontend/src/app/vehicles/list/VehiclesMapClient.tsx
"use client";

/**
 * فقط در کلاینت اجرا می‌شود.
 * - ensureLeafletIcons: لود تنبل leaflet + CSS + آیکون‌ها
 * - نقشه با z-0 رندر می‌شود تا روی عناصر دیگر ننشیند
 */

import { useEffect, useState, useMemo } from "react";
import ensureLeafletIcons from "@/lib/leaflet-fix";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

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
    <Marker key={m.id} position={m.position}>
      <Popup>
        <div className="text-sm">
          <div className="font-semibold">{m.title}</div>
          {m.description ? <div className="text-muted-foreground">{m.description}</div> : null}
        </div>
      </Popup>
    </Marker>
  ));

  return (
    <div className="relative z-0 w-full h-[70vh] rounded-2xl overflow-hidden border">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        scrollWheelZoom
        preferCanvas
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {useCluster ? <MarkerClusterGroup>{markersEl}</MarkerClusterGroup> : markersEl}
      </MapContainer>
    </div>
  );
}
