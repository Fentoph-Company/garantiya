"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";

export default function ChangePassword(){
 const [a,setA]=useState(""),[b,setB]=useState(""),[e,setE]=useState(""),[ok,setOk]=useState(false);const router=useRouter();
 async function submit(ev:any){ev.preventDefault();setE("");const r=await fetch("/api/auth/change-password",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({currentPassword:a,newPassword:b})});const d=await r.json();if(!r.ok){setE(d.error);return}setOk(true);setTimeout(()=>router.push("/admin/security"),500)}
 return <form className="panel-form compact" onSubmit={submit}><div className="panel-card-head"><div><strong>Parolni almashtirish</strong><small>Administrator hisobining parolini yangilang.</small></div></div><label>Amaldagi parol<input type="password" minLength={8} required value={a} onChange={x=>setA(x.target.value)}/></label><label>Yangi parol<input type="password" minLength={12} required value={b} onChange={x=>setB(x.target.value)} placeholder="Kamida 12 belgi"/></label>{e&&<div className="error-box">{e}</div>}{ok&&<div className="warning-box">Parol muvaffaqiyatli almashtirildi.</div>}<button className="primary-button">Parolni almashtirish</button></form>
}
