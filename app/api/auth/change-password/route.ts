import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {readSession} from "@/lib/security";
const schema=z.object({currentPassword:z.string().min(8).max(128),newPassword:z.string().min(12).max(128)});
export async function POST(req:Request){
 const s=await readSession(); if(!s)return NextResponse.json({error:"Sessiya topilmadi."},{status:401});
 try{const b=schema.parse(await req.json());const u=await prisma.user.findUnique({where:{id:s.sub}});if(!u||!(await bcrypt.compare(b.currentPassword,u.passwordHash)))return NextResponse.json({error:"Amaldagi parol noto‘g‘ri."},{status:400});
 if(b.currentPassword===b.newPassword)return NextResponse.json({error:"Yangi parol eski paroldan farq qilishi kerak."},{status:400});
 await prisma.user.update({where:{id:u.id},data:{passwordHash:await bcrypt.hash(b.newPassword,12),mustChangePassword:false}});
 return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Yangi parol talablarga javob bermadi."},{status:400})}
}