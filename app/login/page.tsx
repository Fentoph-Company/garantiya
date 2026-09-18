"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
export default function Login() {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const router=useRouter();
  async function submit(e:FormEvent){e.preventDefault();setError("");const r=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){setError(d.error||"Xatolik");return}router.push(d.mustChangePassword?"/account/password":(d.role==="ADMIN"?"/admin":"/seller"))}
  return <main className="auth-page"><form onSubmit={submit} className="auth-card"><a className="brand" href="/"><b>G</b>garantiya</a><h1>Tizimga kirish</h1><p>Administrator yoki do‘kon sotuvchisi hisobingiz orqali kiring.</p><label>Elektron pochta<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Parol<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label>{error&&<div className="error-box">{error}</div>}<button className="btn dark">Kirish</button></form></main>
}