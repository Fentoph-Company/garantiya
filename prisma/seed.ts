import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL va ADMIN_PASSWORD .env faylida bo‘lishi shart.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD kamida 12 belgidan iborat bo‘lishi kerak.");

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: { passwordHash, role: Role.ADMIN, shopId: null, mustChangePassword: false },
    create: { email: email.toLowerCase().trim(), passwordHash, role: Role.ADMIN, mustChangePassword: false }
  });
  console.log("Administrator hisobi tayyor.");
}
main().finally(() => prisma.$disconnect());
