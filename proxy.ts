import { NextRequest, NextResponse } from "next/server";

export default function proxy(_req: NextRequest) {
  // Admin sahifasi autentifikatsiyani /admin/page.tsx ichida tekshiradi.
  // Proxy ichida Prisma chaqirish serverless edge/proxy qatlamida 502 keltirib
  // chiqarishi mumkin, shuning uchun bu yerda ma'lumotlar bazasiga ulanmaymiz.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
