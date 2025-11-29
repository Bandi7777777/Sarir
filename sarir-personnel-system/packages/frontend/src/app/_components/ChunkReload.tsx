'use client';

import { useEffect } from 'react';

export default function ChunkReload() {
  useEffect(() => {
    const alreadyReloaded = sessionStorage.getItem('__next_chunk_reloaded') === '1';

    const handler = (e: ErrorEvent | PromiseRejectionEvent) => {
      const msg = "message" in e ? String(e.message || "") : String(e.reason || "");
      const isChunkErr =
        msg.includes('Loading chunk') ||
        msg.includes('ChunkLoadError') ||
        msg.includes('failed to fetch dynamically imported module');

      if (isChunkErr && !alreadyReloaded) {
        sessionStorage.setItem('__next_chunk_reloaded', '1');
        window.location.reload();
      }
    };

    window.addEventListener('error', handler);
    window.addEventListener('unhandledrejection', handler);
    return () => {
      window.removeEventListener('error', handler);
      window.removeEventListener('unhandledrejection', handler);
    };
  }, []);

  return null;
}
