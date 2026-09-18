import {NextResponse} from "next/server";
import {z} from "zod";
import {prisma} from "@/lib/prisma";
import {readSession,hashIp} from "@/lib/security";
const schema=z.object({path:z.string().trim().regex(/^\/[a-z0-9][a-z0-9_-]{2,48}$/i,"Yo‘l faqat / bilan boshlansin va xavfsiz belgilar ishlatilsin.")});
export async function GET(){const s=await prisma.appSetting.findUnique({where:{key:"admin_path"}});return NextResponse.json({path:s?.value||"/admin"},{headers:{"Cache-Control":"no-store"}})}
export async function PUT(req:Request){
 const session=await readSession();if(!session||session.role!=="ADMIN")return NextResponse.json({error:"Ruxsat yo‘q."},{status:403});
 try{const {path}=schema.parse(await req.json());if(["/login","/seller","/privacy","/terms","/403","/502"].includes(path))return NextResponse.json({error:"Bu yo‘l band. Boshqa yo‘l tanlang."},{status:409});
 const old=await prisma.appSetting.findUnique({where:{key:"admin_path"}});await prisma.appSetting.upsert({where:{key:"admin_path"},update:{value:path},create:{key:"admin_path",value:path}});
 await prisma.auditLog.create({data:{actorId:session.sub,action:"ADMIN_PATH_CHANGED",entity:"AppSetting",entityId:old?.id,ipHash:hashIp(req.headers.get("x-forwarded-for")??"unknown")}});
 return NextResponse.json({ok:true,path});
 }catch{return NextResponse.json({error:"Administrator yo‘li noto‘g‘ri."},{status:400})}
}