import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/security";
import AdminNav from "@/app/admin/AdminNav";
import ShopsPage from "@/app/admin/shops/page";
import WarrantiesPage from "@/app/admin/warranties/page";
import SecurityPage from "@/app/admin/security/page";
import DangerZone from "@/app/admin/security/DangerZone";

export const dynamic = "force-dynamic";

export default async function DynamicAdminPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const segments = (await params).path ?? [];
  if (!segments.length) notFound();

  const setting = await prisma.appSetting.findUnique({ where: { key: "admin_path" } });
  const adminPath = setting?.value || "/admin";
  const base = adminPath.replace(/^\//, "").replace(/\/$/, "");

  if (segments[0] !== base) notFound();

  const session = await readSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  const section = segments[1] || "shops";
  const subsection = segments[2];
  if (segments.length > 3 || !["shops", "warranties", "security"].includes(section)) notFound();
  if (section !== "security" && subsection) notFound();
  if (section === "security" && subsection && subsection !== "danger") notFound();

  return (
    <main className="panel-page">
      <div className="panel-shell">
        <header className="panel-header">
          <a className="brand" href="/"><b>G</b>garantiya</a>
          <span className="panel-role">Administrator</span>
        </header>
        <AdminNav basePath={adminPath} />
        {section === "shops" && <ShopsPage />}
        {section === "warranties" && <WarrantiesPage />}
        {section === "security" && !subsection && <SecurityPage />}
        {section === "security" && subsection === "danger" && <DangerZone />}
      </div>
    </main>
  );
}
