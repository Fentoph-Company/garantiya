"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/shops", label: "Do‘konlar" },
  { href: "/admin/warranties", label: "Garantiya talonlar" },
  { href: "/admin/security", label: "Xavfsizlik" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="panel-nav" aria-label="Administrator bo‘limlari">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={pathname === item.href ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
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
