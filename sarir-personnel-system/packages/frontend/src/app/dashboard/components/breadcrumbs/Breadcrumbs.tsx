'use client';
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
  const crumbs = [{ name: "خانه", href: "/" }, ...parts.map((seg, i) => ({ name: decodeURIComponent(seg), href: "/" + parts.slice(0, i + 1).join("/") }))];

  return (
    <nav className="breadcrumbs text-xs">
      <ol className="flex items-center gap-1 opacity-80">
        {crumbs.map((c, idx) => {
          const last = idx === crumbs.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1">
              {!last ? (<><Link href={c.href} className="breadcrumb-link">{c.name}</Link><span className="breadcrumb-sep">/</span></>) :
                (<span className="breadcrumb-current">{c.name}</span>)}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
