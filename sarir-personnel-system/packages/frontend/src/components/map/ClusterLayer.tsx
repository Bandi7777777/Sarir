"use client";

import React, { useMemo } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import Supercluster from "supercluster";

type LatLngExpression = [number, number];

export type ClusterPoint = { id: string | number; position: [number, number]; title?: string };

export default function ClusterLayer({ points, radius = 60, maxZoom = 18 }: { points: ClusterPoint[]; radius?: number; maxZoom?: number; }) {
  const map = useMap();

  const clusters = useMemo(() => {
    const index = new (Supercluster as any)({ radius, maxZoom });
    const feats = points.map((p) => ({
      type: "Feature" as const,
      properties: { point: p },
      geometry: { type: "Point" as const, coordinates: [p.position[1], p.position[0]] }
    }));
    index.load(feats as any);
    const b = map.getBounds();
    const bbox: [number, number, number, number] = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
    const zoom = Math.round(map.getZoom());
    return index.getClusters(bbox, zoom);
  }, [points, map, radius, maxZoom]);

  return (
    <>
      {clusters.map((c: any) => {
        const [lng, lat] = c.geometry.coordinates;
        const pos: LatLngExpression = [lat, lng];

        if (c.properties.cluster) {
          const count = c.properties.point_count;
          return (
            <Marker key={`cluster-${c.id}`} position={pos}>
              <Popup>Cluster: {count} items</Popup>
            </Marker>
          );
        }
        const pt: ClusterPoint = c.properties.point;
        return (
          <Marker key={pt.id} position={pt.position}>
            <Popup>{pt.title || pt.id}</Popup>
          </Marker>
        );
      })}
    </>
  );
}
