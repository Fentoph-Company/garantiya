"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerNav() {
  const pathname = usePathname();

  return (
    <nav className="panel-nav seller-nav" aria-label="Do‘kon bo‘limlari">
      <Link href="/seller/new" className={pathname === "/seller/new" ? "active" : ""}>
        Yangi garantiya
      </Link>
      <Link href="/seller/warranties" className={pathname === "/seller/warranties" ? "active" : ""}>
        Do‘kondagi garantiyalar
      </Link>
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
