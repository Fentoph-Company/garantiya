import { redirect } from "next/navigation";
import { readSession } from "@/lib/security";

export default async function SellerLayout({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  if (!session || session.role !== "SELLER" || !session.shopId) redirect("/login");
  return children;
}
