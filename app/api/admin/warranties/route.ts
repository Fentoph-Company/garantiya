import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession, hashIp } from "@/lib/security";

const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin uchun." }, { status: 403, headers: noStore });
  }

  const items = await prisma.warranty.findMany({
    where: { deletedAt: null },
    include: {
      shop: { select: { name: true } },
      seller: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    items.map((w) => ({
      ...w,
      price: w.price.toString(),
      adminLink: "/w/" + w.publicToken,
    })),
    { headers: noStore },
  );
}

export async function DELETE(req: Request) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Faqat admin uchun." }, { status: 403, headers: noStore });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID kerak." }, { status: 400, headers: noStore });
  }

  const warranty = await prisma.warranty.findUnique({ where: { id } });
  if (!warranty || warranty.deletedAt) {
    return NextResponse.json({ error: "Kafolat topilmadi." }, { status: 404, headers: noStore });
  }

  const ipHash = hashIp(req.headers.get("x-forwarded-for") ?? "unknown");

  await prisma.warranty.update({
    where: { id },
    data: {
      deletedAt: new Date(),
      expiredAt: warranty.expiredAt ?? (warranty.warrantyTo <= new Date() ? new Date() : null),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.sub,
      action: "WARRANTY_DELETED_BY_ADMIN",
      entity: "Warranty",
      entityId: id,
      ipHash,
    },
  });

  return NextResponse.json({ ok: true }, { headers: noStore });
}
