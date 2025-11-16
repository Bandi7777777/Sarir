// packages/frontend/src/components/ui/Sidebar.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  UsersIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
  BellIcon,
  TruckIcon,
  BuildingOffice2Icon,
  ChartPieIcon,
  PresentationChartBarIcon,
  ArrowUpTrayIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

/* ── استایل ثابت سایدبار ── */
const WRAP =
  "h-full flex flex-col justify-between rounded-2xl border bg-[#040719]/95 text-white border-white/10 shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-xl overflow-hidden";
const BTN_BASE =
  "w-full flex items-center rounded-2xl border transition-all focus:outline-none";
const BTN_ACTIVE =
  "bg-white/15 border-cyan-400/40 text-white shadow-[0_12px_36px_rgba(0,0,0,.35)]";
const BTN_IDLE =
  "bg-white/8 border-white/10 text-white/85 hover:bg-white/12";
const ICON_BOX =
  "relative inline-grid place-items-center w-10 h-10 aspect-square rounded-xl overflow-hidden bg-white/8";

type SidebarProps = { expanded?: boolean; setExpanded?: (v: boolean) => void };
type CatItem = {
  href: string;
  label: string;
  icon: (c?: string) => JSX.Element;
  badge?: number | undefined;
};
type Category = {
  key: string;
  label: string;
  icon: (c?: string) => JSX.Element;
  items: CatItem[];
};

export default function Sidebar(props: SidebarProps) {
  const { expanded: expandedProp, setExpanded: setExpandedProp } = props;

  /* جلوگیری از چند سایدبار همزمان در DOM */
  const rootRef = useRef<HTMLElement | null>(null);
  const [isClone, setIsClone] = useState(false);

  useEffect(() => {
    const existing = document.querySelector(
      '[data-root-sidebar="true"]',
    ) as HTMLElement | null;

    if (existing && existing !== rootRef.current) {
      setIsClone(true);
      return;
    }

    if (rootRef.current) {
      rootRef.current.setAttribute("data-root-sidebar", "true");
    }

    return () => {
      if (rootRef.current?.getAttribute("data-root-sidebar") === "true") {
        rootRef.current.removeAttribute("data-root-sidebar");
      }
    };
  }, []);

  // کنترل باز/جمع + پشتیبانی از prop
  const [expandedState, setExpandedState] = useState<boolean>(
    () => !!expandedProp,
  );

  useEffect(() => {
    if (typeof expandedProp === "boolean") setExpandedState(expandedProp);
  }, [expandedProp]);

  const setExpanded =
    typeof setExpandedProp === "function" ? setExpandedProp : setExpandedState;
  const isExpanded =
    typeof expandedProp === "boolean" ? expandedProp : expandedState;

  // حالت پین‌شده (ثابت) + ذخیره در localStorage
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("sarirSidebarPinned");
    if (saved === "1") {
      setPinned(true);
      setExpanded(true);
    }
  }, [setExpanded]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sarirSidebarPinned", pinned ? "1" : "0");
  }, [pinned]);

  const pathname = usePathname();

  const [notifCount, setNotifCount] = useState<number | undefined>();
  const [driversCount, setDriversCount] = useState<number | undefined>();

  useEffect(() => {
    // TODO: اتصال به API واقعی
    setNotifCount(undefined);
    setDriversCount(undefined);
  }, []);

  const CATEGORIES: Category[] = useMemo(
    () => [
      {
        key: "base",
        label: "اطلاعات پایه",
        icon: (cls = "h-5 w-5") => <HomeIcon className={cls} />,
        items: [
          {
            href: "/dashboard",
            label: "داشبورد",
            icon: (c = "h-4 w-4") => <HomeIcon className={c} />,
          },
          {
            href: "/board/list",
            label: "هیئت‌مديره",
            icon: (c = "h-4 w-4") => <BuildingOffice2Icon className={c} />,
          },
          {
            href: "/personnel/list",
            label: "كاركنان",
            icon: (c = "h-4 w-4") => <UsersIcon className={c} />,
          },
          {
            href: "/drivers/list",
            label: "رانندگان",
            icon: (c = "h-4 w-4") => <TruckIcon className={c} />,
            badge: driversCount,
          },
        ],
      },
      {
        key: "actions",
        label: "عمليات",
        icon: (cls = "h-5 w-5") => <UserPlusIcon className={cls} />,
        items: [
          {
            href: "/personnel/register",
            label: "ثبت كارمند",
            icon: (c = "h-4 w-4") => <UserPlusIcon className={c} />,
          },
          {
            href: "/drivers/register",
            label: "ثبت راننده",
            icon: (c = "h-4 w-4") => <TruckIcon className={c} />,
          },
          {
            href: "/tools/import",
            label: "ورود از اكسل",
            icon: (c = "h-4 w-4") => <ArrowUpTrayIcon className={c} />,
          },
        ],
      },
      {
        key: "analytics",
        label: "آمار و گزارش",
        icon: (cls = "h-5 w-5") => <ChartPieIcon className={cls} />,
        items: [
          {
            href: "/stats/personnel",
            label: "آمار كاركنان",
            icon: (c = "h-4 w-4") => <ChartPieIcon className={c} />,
          },
          {
            href: "/stats/drivers",
            label: "آمار رانندگان",
            icon: (c = "h-4 w-4") => (
              <PresentationChartBarIcon className={c} />
            ),
          },
          {
            href: "/reports",
            label: "گزارش‌ها",
            icon: (c = "h-4 w-4") => (
              <ClipboardDocumentListIcon className={c} />
            ),
          },
          {
            href: "/notifications",
            label: "اعلان‌ها",
            icon: (c = "h-4 w-4") => <BellIcon className={c} />,
            badge: notifCount,
          },
        ],
      },
    ],
    [driversCount, notifCount],
  );

  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [hoverCategory, setHoverCategory] = useState<string | null>(null);

  const hoverCategoryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href || pathname === `${href}/`
      : pathname.startsWith(href);

  const handleHoverCategory = (key: string | null) => {
    if (hoverCategoryTimer.current) clearTimeout(hoverCategoryTimer.current);
    hoverCategoryTimer.current = setTimeout(
      () => setHoverCategory(key),
      key ? 90 : 140,
    );
  };

  const handleMouseEnter = () => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    if (expandTimer.current) clearTimeout(expandTimer.current);
    if (pinned) return;
    // کمی تأخیر برای جمع شدن، تا حس نرم‌تری بده
    expandTimer.current = setTimeout(() => {
      setExpanded(false);
    }, 280);
  };

  useEffect(
    () => () => {
      if (hoverCategoryTimer.current) clearTimeout(hoverCategoryTimer.current);
      if (expandTimer.current) clearTimeout(expandTimer.current);
    },
    [],
  );

  if (isClone) return null;

  return (
    <nav
      ref={rootRef as any}
      role="navigation"
      aria-label="Sidebar"
      data-root-sidebar="true"
      className="
        order-last shrink-0
        h-screen
        pe-3 pt-3
        transition-[width] duration-[700ms] ease-[cubic-bezier(0.22,0.8,0.3,1)]
      "
      style={{ width: isExpanded ? 256 : 72 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={WRAP}>
        {/* هدر لوگو / برند */}
        <div className="flex items-center justify-center gap-2 px-3 py-4 border-b border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-1 ring-white/15 bg-white shadow-[0_8px_24px_rgba(0,0,0,.2)] p-1">
              <img
                src="/images/logo-sarir-2.svg"
                alt="Sarir Logistics"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  if (!el.src.endsWith(".png")) {
                    el.src = "/images/logo-sarir-2.png";
                  }
                }}
              />
            </div>
            {isExpanded && (
              <div className="leading-tight">
                <div className="font-extrabold tracking-wide">سریر</div>
                <div className="text-[11px] opacity-70">
                  سیستم مدیریت پرسنل
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* آیتم‌ها */}
        <ul className="mt-1 px-2 space-y-2 flex-1 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const open = isExpanded && openCategory === cat.key;
            const hoverOpen = !isExpanded && hoverCategory === cat.key;

            return (
              <li key={cat.key} className="relative">
                <button
                  type="button"
                  className={`${BTN_BASE} ${
                    isExpanded ? "gap-3 px-2.5 py-2" : "justify-center py-2"
                  } ${
                    cat.items.some((it) => isActive(it.href)) ||
                    open ||
                    hoverOpen
                      ? BTN_ACTIVE
                      : BTN_IDLE
                  }`}
                  onClick={() => {
                    if (isExpanded) {
                      setOpenCategory((p) => (p === cat.key ? null : cat.key));
                    }
                  }}
                  onMouseEnter={() =>
                    !isExpanded && handleHoverCategory(cat.key)
                  }
                  onMouseLeave={() =>
                    !isExpanded && handleHoverCategory(null)
                  }
                  aria-expanded={!!(open || hoverOpen)}
                  aria-label={cat.label}
                  title={!isExpanded ? cat.label : undefined}
                >
                  <span className={ICON_BOX}>
                    <span className="absolute inset-0 bg-gradient-to-br from-cyan-400/80 to-indigo-500/80" />
                    <span className="relative z-10 text-[#0b1220]">
                      {cat.icon("h-5 w-5")}
                    </span>
                  </span>
                  {isExpanded && (
                    <span className="truncate font-medium">{cat.label}</span>
                  )}
                </button>

                {/* زیرمنو در حالت باز (expanded) */}
                {isExpanded && (
                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                      open
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                    aria-hidden={!open}
                  >
                    <ul className="overflow-hidden ps-3 pe-1 pt-1 space-y-1">
                      {cat.items.map((it) => {
                        const active = isActive(it.href);
                        const badge = it.badge;
                        return (
                          <li key={it.href}>
                            <Link
                              href={it.href}
                              className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border ${
                                active ? BTN_ACTIVE : BTN_IDLE
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="inline-grid place-items-center w-7 h-7 rounded-xl bg-white/10">
                                  {it.icon("h-4 w-4 text-white/90")}
                                </span>
                                <span className="text-sm">{it.label}</span>
                              </span>
                              {typeof badge === "number" && (
                                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-[11px] text-white grid place-items-center">
                                  {badge > 99 ? "99+" : badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Flyout در حالت جمع‌شده */}
                {!isExpanded && hoverOpen && (
                  <div
                    className="absolute right-[72px] top-0 z-50"
                    onMouseEnter={() => handleHoverCategory(cat.key)}
                    onMouseLeave={() => handleHoverCategory(null)}
                  >
                    <div className="min-w-[220px] rounded-2xl border border-white/15 bg-[#050816]/95 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,.45)] p-2">
                      <div className="px-2 py-1 mb-1 text-[11px] text-white/70">
                        {cat.label}
                      </div>
                      <ul className="space-y-1">
                        {cat.items.map((it) => {
                          const active = isActive(it.href);
                          const badge = it.badge;
                          return (
                            <li key={it.href}>
                              <Link
                                href={it.href}
                                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border ${
                                  active ? BTN_ACTIVE : BTN_IDLE
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span className="inline-grid place-items-center w-7 h-7 rounded-xl bg-white/10">
                                    {it.icon("h-4 w-4 text-white/90")}
                                  </span>
                                  <span className="text-sm">{it.label}</span>
                                </span>
                                {typeof badge === "number" && (
                                  <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-[11px] text-white grid place-items-center">
                                    {badge > 99 ? "99+" : badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* پین / آن‌پین سایدبار پایین */}
        <div className="border-t border-white/10 px-2 py-2">
          <button
            type="button"
            onClick={() => {
              const next = !pinned;
              setPinned(next);
              if (next) setExpanded(true);
            }}
            className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] transition-all ${
              pinned
                ? "bg-cyan-500/20 text-cyan-100"
                : "text-white/70 hover:bg-white/10"
            }`}
          >
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-white/8">
              <MapPinIcon
                className={`h-3.5 w-3.5 ${
                  pinned ? "text-cyan-300" : "text-white/70"
                }`}
              />
            </span>
            <span>
              {pinned ? "سایدبار ثابت است" : "ثابت نگه‌داشتن سایدبار"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
}
