import { redirect } from "next/navigation";
import { readSession } from "@/lib/security";
import AdminNav from "./AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") redirect("/login");

  return (
    <main className="panel-page">
      <div className="panel-shell">
        <header className="panel-header">
          <a className="brand" href="/">
            <b>G</b>garantiya
          </a>
          <span className="panel-role">Administrator</span>
        </header>
        <AdminNav />
        {children}
      </div>
    </main>
  );
}
