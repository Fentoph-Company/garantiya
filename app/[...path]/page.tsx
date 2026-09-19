import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/security";
import AdminNav from "@/app/admin/AdminNav";
import ShopsPage from "@/app/admin/shops/page";
import WarrantiesPage from "@/app/admin/warranties/page";
import SecurityPage from "@/app/admin/security/page";

export const dynamic = "force-dynamic";

export default async function DynamicAdminPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const segments = (await params).path ?? [];
  if (!segments.length) notFound();

  const setting = await prisma.appSetting.findUnique({ where: { key: "admin_path" } });
  const adminPath = setting?.value || "/admin";
  const base = adminPath.replace(/^\//, "").replace(/\/$/, "");

  if (segments[0] !== base) notFound();

  const session = await readSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const section = segments[1] || "shops";
  if (segments.length > 2 || !["shops", "warranties", "security"].includes(section)) notFound();

  return (
    <main className="panel-page">
      <div className="panel-shell">
        <header className="panel-header">
          <a className="brand" href="/">
            <b>G</b>garantiya
          </a>
          <span className="panel-role">Administrator</span>
        </header>
        <AdminNav basePath={adminPath} />
        {section === "shops" && <ShopsPage />}
        {section === "warranties" && <WarrantiesPage />}
        {section === "security" && <SecurityPage />}
      </div>
    </main>
  );
}
