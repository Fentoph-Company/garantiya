import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, hashIp } from "@/lib/security";

export async function GET() {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Faqat admin uchun." }, { status: 403 });
  const items = await prisma.warranty.findMany({
    include: { shop: { select: { name: true } }, seller: { select: { email: true } } },
    orderBy: { createdAt: "desc" }, take: 200
  });
  return NextResponse.json(items.map(w => ({ ...w, price: w.price.toString(), adminLink: "/w/" + w.publicToken })));
}
export async function DELETE(req: Request) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Faqat admin uchun." }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID kerak." }, { status: 400 });
  const warranty = await prisma.warranty.findUnique({ where: { id } });
  if (!warranty) return NextResponse.json({ error: "Kafolat topilmadi." }, { status: 404 });
  if (warranty.warrantyTo > new Date()) return NextResponse.json({ error: "Faol kafolatni o‘chirish mumkin emas. U faqat muddati tugagandan keyin o‘chiriladi." }, { status: 409 });
  await prisma.warranty.update({ where: { id }, data: { deletedAt: new Date(), status: "EXPIRED", expiredAt: warranty.expiredAt ?? new Date() } });
  await prisma.auditLog.create({ data: { actorId: session.sub, action: "WARRANTY_DELETED_BY_ADMIN", entity: "Warranty", entityId: id, ipHash: hashIp(req.headers.get("x-forwarded-for") ?? "unknown") } });
  return NextResponse.json({ ok: true });
}