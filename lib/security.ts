import {SignJWT,jwtVerify} from "jose";import {cookies} from "next/headers";import {createHash,randomBytes} from "crypto";
const secret=process.env.AUTH_SECRET;if(!secret)throw new Error("AUTH_SECRET is required");const key=new TextEncoder().encode(secret);
export type Session={sub:string;role:"ADMIN"|"SELLER";shopId?:string};
export async function createSession(s:Session){return new SignJWT(s).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(key)}
export async function requireRole(role:"ADMIN"|"SELLER"){const s=await readSession();if(!s||s.role!==role)throw new Error("FORBIDDEN");return s}\nexport async function readSession(){const c=await cookies();const token=c.get("session")?.value;if(!token)return null;try{return (await jwtVerify(token,key)).payload as unknown as Session}catch{return null}}
export function randomToken(){return randomBytes(24).toString("base64url")}
export function hashIp(ip:string){return createHash("sha256").update((process.env.AUDIT_SALT??"change-me")+ip).digest("hex")}