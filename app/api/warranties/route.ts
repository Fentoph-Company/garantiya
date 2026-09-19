import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomToken, readSession, hashIp } from "@/lib/security";

const schema = z.object({
  model: z.string().trim().min(1).max(120),
  price: z.coerce.number().finite().nonnegative().max(999999999999),
  // HTML <input type="date"> yuboradigan YYYY-MM-DD format.
  warrantyTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Sana formati noto‘g‘ri."),
  ram: z.string().trim().max(50).optional(),
  memory: z.string().trim().max(80).optional(),
  product: z.string().trim().min(1).max(100),
});

function parseWarrantyDate(dateOnly: string) {
  // O‘zbekiston vaqti (UTC+05:00) bo‘yicha tanlangan kunning oxiri.
  const date = new Date(`${dateOnly}T23:59:59.999+05:00`);

  if (Number.isNaN(date.getTime())) return null;

  // 2026-02-31 kabi mavjud bo‘lmagan sanalarni rad etish.
  const [year, month, day] = dateOnly.split("-").map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
}

export async function GET() {
  const session = await readSession();
  if (!session || session.role !== "SELLER" || !session.shopId) {
    return NextResponse.json({ error: "Ruxsat yo‘q." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }
  const items = await prisma.warranty.findMany({
    where: { shopId: session.shopId },
    orderBy: { createdAt: "desc" },
    select: { id: true, publicToken: true, product: true, model: true, price: true, startingDate: true, warrantyTo: true, status: true },
  });
  return NextResponse.json(items.map(w => ({ ...w, price: w.price.toString() })), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const session = await readSession();

  if (!session || session.role !== "SELLER" || !session.shopId) {
    return NextResponse.json(
      { error: "Ruxsat yo‘q." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body = schema.parse(await req.json());
    const start = new Date();
    const warrantyTo = parseWarrantyDate(body.warrantyTo);

    if (!warrantyTo) {
      return NextResponse.json(
        { error: "Kafolat tugash sanasi noto‘g‘ri." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (warrantyTo <= start) {
      return NextResponse.json(
        { error: "Kafolat tugash sanasi bugundan keyin bo‘lishi kerak." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    const warranty = await prisma.warranty.create({
      data: {
        model: body.model,
        price: body.price,
        warrantyTo,
        startingDate: start,
        ram: body.ram || null,
        memory: body.memory || null,
        product: body.product,
        publicToken: randomToken(),
        shopId: session.shopId,
        sellerId: session.sub,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: "WARRANTY_CREATED",
        entity: "Warranty",
        entityId: warranty.id,
        ipHash: hashIp(req.headers.get("x-forwarded-for") ?? "unknown"),
      },
    });

    return NextResponse.json(
      {
        id: warranty.id,
        token: warranty.publicToken,
        link: "/w/" + warranty.publicToken,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Ma’lumotlar formati noto‘g‘ri." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("WARRANTY_CREATE_ERROR", error);

    return NextResponse.json(
      { error: "Kafolatni yaratishda server xatoligi yuz berdi." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
