import { redirect } from "next/navigation";
import { readSession } from "@/lib/security";
import SellerNav from "./SellerNav";

export default async function SellerLayout({children}:{children:React.ReactNode}){
 const s=await readSession();if(!s||s.role!=="SELLER"||!s.shopId)redirect("/login");
 return <main className="seller-page"><div className="seller-shell"><header className="seller-topbar"><a className="brand" href="/"><b>G</b>garantiya</a><SellerNav/></header>{children}</div></main>
}
