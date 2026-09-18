import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession, randomToken, hashIp } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(250).optional()
});

export async function POST(req: Request) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Ruxsat yo‘q." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  try {
    const body = schema.parse(await req.json());
    const temporaryPassword = randomToken().slice(0, 14);
    const shop = await prisma.shop.create({
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        users: { create: { email: body.email.toLowerCase(), passwordHash: await bcrypt.hash(temporaryPassword, 12), role: "SELLER" } }
      }
    });
    await prisma.auditLog.create({ data: { actorId: session.sub, action: "SHOP_CREATED", entity: "Shop", entityId: shop.id, ipHash: hashIp(req.headers.get("x-forwarded-for") ?? "unknown") } });
    return NextResponse.json({ shopId: shop.id, login: body.email.toLowerCase(), temporaryPassword });
  } catch { return NextResponse.json({ error: "Do'kon yaratilmadi. Email band bo'lishi mumkin." }, { status: 400 }); }
}