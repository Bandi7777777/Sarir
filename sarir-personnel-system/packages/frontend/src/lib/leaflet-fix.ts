// packages/frontend/src/lib/leaflet-fix.ts
// Note: require() usage is intentional to keep this SSR-safe when window is unavailable.
// هدف: لود تنبل leaflet فقط در محیط کلاینت و فیکس آیکون‌ها بدون SSR error (window is not defined)
/* eslint-disable @typescript-eslint/no-require-imports */

let _patched = false;

/**
 * ensureLeafletIcons
 * - فقط در کلاینت اجرا می‌شود (گارد typeof window)
 * - leaflet و CSS و آیکون‌ها را با require لود می‌کند تا از SSR-safe باشد
 * - یک‌بار پچ می‌کند (_patched) تا چندباره اعمال نشود
 */
export function ensureLeafletIcons() {
  if (_patched) return;
  if (typeof window === "undefined") return;

  // لود تنبل: SSR این کد را اجرا نمی‌کند
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const L: typeof import("leaflet") = require("leaflet");

  // CSS اصلی leaflet
  require("leaflet/dist/leaflet.css");

  // مسیر آیکون‌ها
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const iconRetinaUrl = require("leaflet/dist/images/marker-icon-2x.png");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const iconUrl = require("leaflet/dist/images/marker-icon.png");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const shadowUrl = require("leaflet/dist/images/marker-shadow.png");

  // اعمال مسیرهای صحیح آیکون‌ها
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });

  _patched = true;
}

export default ensureLeafletIcons;
