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
  await prisma.warranty.update({ where: { id }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({ data: { actorId: session.sub, action: "WARRANTY_DELETED_BY_ADMIN", entity: "Warranty", entityId: id, ipHash: hashIp(req.headers.get("x-forwarded-for") ?? "unknown") } });
  return NextResponse.json({ ok: true });
}