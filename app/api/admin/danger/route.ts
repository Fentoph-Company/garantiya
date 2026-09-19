import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { readSession, hashIp } from "@/lib/security";

const ACTIONS = {
  shops: "DO‘KONLARNI TO‘LIQ O‘CHIRISH",
  warranties: "GARANTIYALARNI TO‘LIQ O‘CHIRISH",
} as const;

const schema = z.object({
  action: z.enum(["grant_admin", "delete_shops", "delete_warranties"]),
  password: z.string().min(1).max(128),
  confirmation: z.string().max(80).optional(),
  targetEmail: z.string().email().max(254).optional(),
});

export async function POST(req: Request) {
  const session = await readSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo‘q." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  try {
    const body = schema.parse(await req.json());
    const actor = await prisma.user.findUnique({ where: { id: session.sub } });

    if (!actor || actor.role !== "ADMIN" || !(await bcrypt.compare(body.password, actor.passwordHash))) {
      return NextResponse.json({ error: "Administrator paroli noto‘g‘ri." }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }

    const ipHash = hashIp(req.headers.get("x-forwarded-for") ?? "unknown");

    if (body.action === "grant_admin") {
      const email = body.targetEmail?.toLowerCase().trim();
      if (!email) return NextResponse.json({ error: "Admin qilinadigan foydalanuvchi loginini kiriting." }, { status: 400 });
      if (email === actor.email) return NextResponse.json({ error: "Bu sizning o‘zingizning loginingiz." }, { status: 400 });

      const target = await prisma.user.findUnique({ where: { email } });
      if (!target) return NextResponse.json({ error: "Bunday foydalanuvchi topilmadi." }, { status: 404 });
      if (target.role === "ADMIN") return NextResponse.json({ error: "Bu foydalanuvchi allaqachon administrator." }, { status: 409 });

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: target.id },
          data: { role: "ADMIN", shopId: null, mustChangePassword: true },
        });
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "ADMIN_RIGHTS_GRANTED",
            entity: "User",
            entityId: target.id,
            ipHash,
          },
        });
      });

      return NextResponse.json({ ok: true, message: "Administrator huquqi berildi. Amaldagi administrator huquqi saqlanib qoldi." }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.action === "delete_warranties") {
      if (body.confirmation !== ACTIONS.warranties) {
        return NextResponse.json({ error: "Tasdiqlash matni noto‘g‘ri." }, { status: 400 });
      }

      const deleted = await prisma.$transaction(async (tx) => {
        const count = await tx.warranty.count();
        await tx.warranty.deleteMany();
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: "ALL_WARRANTIES_HARD_DELETED",
            entity: "Warranty",
            ipHash,
          },
        });
        return count;
      });

      return NextResponse.json({ ok: true, deleted }, { headers: { "Cache-Control": "no-store" } });
    }

    if (body.confirmation !== ACTIONS.shops) {
      return NextResponse.json({ error: "Tasdiqlash matni noto‘g‘ri." }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const [warranties, sellers, shops] = await Promise.all([
        tx.warranty.count(),
        tx.user.count({ where: { role: "SELLER" } }),
        tx.shop.count(),
      ]);

      await tx.warranty.deleteMany();
      await tx.user.deleteMany({ where: { role: "SELLER" } });
      await tx.shop.deleteMany();

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: "ALL_SHOPS_AND_WARRANTIES_HARD_DELETED",
          entity: "Shop",
          ipHash,
        },
      });

      return { warranties, sellers, shops };
    });

    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "So‘rov ma’lumotlari noto‘g‘ri." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    }
    console.error("ADMIN_DANGER_ZONE_ERROR", error);
    return NextResponse.json({ error: "Amal bajarilmadi. Ma’lumotlar o‘zgartirilmadi." }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}