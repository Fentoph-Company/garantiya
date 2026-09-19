import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/security";

const schema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase().trim();

    let user = await prisma.user.findUnique({ where: { email } });

    // Birinchi admin kirishi uchun Vercel/.env dagi ADMIN_EMAIL va
    // ADMIN_PASSWORD avtomatik ravishda administrator hisobini yaratadi.
    if (!user && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();

      if (email === adminEmail && body.password === process.env.ADMIN_PASSWORD) {
        const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

        user = await prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash,
            role: "ADMIN",
            mustChangePassword: false,
          },
        });
      }
    }

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json(
        { error: "Login yoki parol noto‘g‘ri." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    const token = await createSession({
      sub: user.id,
      role: user.role,
      shopId: user.shopId ?? undefined,
    });

    const response = NextResponse.json(
      {
        ok: true,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      { headers: { "Cache-Control": "no-store" } },
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 28800,
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Login yoki parol formati noto‘g‘ri." },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    }

    console.error("AUTH_LOGIN_ERROR", error);

    return NextResponse.json(
      { error: "Serverda ichki xatolik yuz berdi." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
