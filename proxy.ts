import {NextRequest,NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";

export default async function proxy(req:NextRequest){
 const path=req.nextUrl.pathname;
 if(path.startsWith("/api/") || path.startsWith("/w/")) return NextResponse.next();
 if(path==="/admin" || path.startsWith("/admin/") || (path.startsWith("/") && !path.includes(".") && !["/","/login","/seller","/privacy","/terms","/403","/502"].some(x=>path===x||path.startsWith(x+"/")))){
   try{
    const setting=await prisma.appSetting.findUnique({where:{key:"admin_path"}});
    const adminPath=setting?.value||"/admin";
    if(path==="/admin" && adminPath!=="/admin"){
      const url=req.nextUrl.clone();url.pathname=adminPath;return NextResponse.redirect(url);
    }
    if(path===adminPath){
      const url=req.nextUrl.clone();url.pathname="/admin";return NextResponse.rewrite(url);
    }
   }catch{
    if(path==="/admin") return NextResponse.redirect(new URL("/502",req.url));
   }
 }
 return NextResponse.next();
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};