import { redirect } from "next/navigation";
import { readSession } from "@/lib/security";
import ChangePassword from "./ChangePassword";

export default async function PasswordPage(){const s=await readSession();if(!s)redirect("/login");return <main className="auth-page"><ChangePassword/></main>}
