import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const setting = await prisma.appSetting.findUnique({ where: { key: "admin_path" } });
  redirect(`${setting?.value || "/admin"}/shops`);
}
