import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const secret = process.env.AUTH_SECRET;

if (!secret) {
  throw new Error("AUTH_SECRET is required");
}

const key = new TextEncoder().encode(secret);

export type Session = {
  sub: string;
  role: "ADMIN" | "SELLER";
  shopId?: string;
};

export async function createSession(session: Session) {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key);
}

export async function requireRole(role: "ADMIN" | "SELLER") {
  const session = await readSession();

  if (!session || session.role !== role) {
    throw new Error("FORBIDDEN");
  }

  return session;
}

export async function readSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = (await jwtVerify(token, key)).payload;

    if (
      typeof payload.sub !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "SELLER")
    ) {
      return null;
    }

    if (payload.role === "SELLER" && typeof payload.shopId !== "string") {
      return null;
    }

    return {
      sub: payload.sub,
      role: payload.role,
      ...(typeof payload.shopId === "string" ? { shopId: payload.shopId } : {}),
    };
  } catch {
    return null;
  }
}

export function randomToken() {
  return randomBytes(24).toString("base64url");
}

export function hashIp(ip: string) {
  const salt = process.env.AUDIT_SALT;

  if (!salt) {
    throw new Error("AUDIT_SALT is required");
  }

  return createHash("sha256").update(salt + ip).digest("hex");
}
