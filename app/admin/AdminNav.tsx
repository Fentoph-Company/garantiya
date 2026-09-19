"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { key: "shops", label: "Do‘konlar" },
  { key: "warranties", label: "Garantiya talonlar" },
  { key: "security", label: "Xavfsizlik" },
];

export default function AdminNav({ basePath = "/admin" }: { basePath?: string }) {
  const pathname = usePathname();
  const base = basePath.replace(/\/$/, "");

  return (
    <nav className="panel-nav" aria-label="Administrator bo‘limlari">
      {items.map((item) => {
        const href = `${base}/${item.key}`;
        return (
          <Link key={href} href={href} className={pathname === href ? "active" : ""}>
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          location.href = "/login";
        }}
      >
        Chiqish
      </button>
    </nav>
  );
}
