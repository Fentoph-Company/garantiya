import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession, hashIp } from "@/lib/security";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(250).optional(),
});

export async function POST(req: Request) {
  const session = await readSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Ruxsat yo‘q." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(body.password, 12);

    const shop = await prisma.shop.create({
      data: {
        name: body.name,
        phone: body.phone,
        address: body.address,
        users: {
          create: {
            email,
            passwordHash,
            role: "SELLER",
            mustChangePassword: true,
          },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: "SHOP_CREATED",
        entity: "Shop",
        entityId: shop.id,
        ipHash: hashIp(req.headers.get("x-forwarded-for") ?? "unknown"),
      },
    });

    return NextResponse.json(
      { shopId: shop.id, login: email },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Do‘kon ma’lumotlari noto‘g‘ri kiritildi." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("ADMIN_SHOP_CREATE_ERROR", error);

    return NextResponse.json(
      { error: "Do‘kon yaratilmadi. Login band bo‘lishi mumkin." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
