import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
export default async function Warranty({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const w = await prisma.warranty.findUnique({ where: { publicToken: token }, include: { shop: { select: { name: true, phone: true, address: true } } } });
  if (!w || w.deletedAt) return notFound();
  const expired = new Date() > w.warrantyTo;
  return <main className="public-warranty"><div className="w-card"><div className="w-brand"><b>G</b> garantiya</div><div className={"w-status " + (expired ? "expired" : "active")}>{expired ? "KAFOLAT MUDDATI TUGAGAN" : "KAFOLAT FAOL"}</div><h1>{w.product}</h1><p className="model">{w.model}</p><div className="w-grid"><div><small>Narx</small><b>{Number(w.price).toLocaleString("uz-UZ")} {w.currency}</b></div><div><small>Boshlangan sana</small><b>{w.startingDate.toLocaleDateString("uz-UZ")}</b></div><div><small>Kafolatgacha</small><b>{w.warrantyTo.toLocaleDateString("uz-UZ")}</b></div><div><small>Do‘kon</small><b>{w.shop.name}</b></div></div><div className="specs"><span>RAM: {w.ram || "—"}</span><span>Xotira: {w.memory || "—"}</span></div><p className="notice">Ushbu sahifa kafolat ma'lumotlarini tekshirish uchun yaratilgan. Kafolatdan foydalanishda QR kodni servis xodimiga ko'rsating.</p></div></main>
}