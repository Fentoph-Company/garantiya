"use client";
import AdminPathSettings from "./AdminPathSettings";
import {useEffect,useState} from "react";
export default function Admin(){
 const [shops,setShops]=useState({name:"",email:"",phone:"",address:""}),[created,setCreated]=useState<any>(null),[items,setItems]=useState<any[]>([]),[error,setError]=useState("");
 async function load(){const r=await fetch("/api/admin/warranties");if(r.ok)setItems(await r.json())}
 useEffect(()=>{load()},[]);
 async function create(e:any){e.preventDefault();setError("");const r=await fetch("/api/admin/shops",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(shops)});const d=await r.json();if(!r.ok)return setError(d.error);setCreated(d);setShops({name:"",email:"",phone:"",address:""});}
 async function del(id:string){if(!confirm("Ushbu kafolatni o‘chirishni tasdiqlaysizmi?"))return;await fetch("/api/admin/warranties?id="+id,{method:"DELETE"});load()}
 return <main className="auth-page"><section className="auth-card wide-card"><span className="eyebrow">Administrator paneli</span><h1>Boshqaruv markazi</h1><AdminPathSettings/><div className="button-row"><button className="secondary-button" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});location.href="/login"}}>Tizimdan chiqish</button></div><p>Do‘konlar va kafolat yozuvlarini boshqaring.</p>
 <h2>Yangi do‘kon</h2><form className="form-grid" onSubmit={create}>{["name","email","phone","address"].map(k=><label key={k}>{({name:"Do‘kon nomi",email:"Login (elektron pochta)",phone:"Telefon",address:"Manzil"} as any)[k]}<input required={k==="name"||k==="email"} value={(shops as any)[k]} onChange={e=>setShops({...shops,[k]:e.target.value})}/></label>)}<button className="primary-button form-submit">Do‘kon yaratish</button></form>
 {error&&<div className="error-box">{error}</div>}{created&&<div className="warning-box"><strong>Login:</strong> {created.login}<br/><strong>Vaqtinchalik parol:</strong> {created.temporaryPassword}<br/>Bu parolni xavfsiz joyga saqlang. U sotuvchiga birinchi kirishda almashtirilishi kerak.</div>}
 <h2 style={{marginTop:40}}>Kafolatlar</h2><div>{items.map(w=><div key={w.id} className="link-box" style={{marginBottom:10}}><strong>{w.product} — {w.model}</strong><br/>Do‘kon: {w.shop.name} · Narx: {w.price} UZS · Tugash: {new Date(w.warrantyTo).toLocaleDateString("uz-UZ")}<br/>{new Date(w.warrantyTo) <= new Date() ? <button className="secondary-button" onClick={()=>del(w.id)}>O‘chirish</button> : <span style={{fontSize:12,color:"#888"}}>Faol — o‘chirish mumkin emas</span>}</div>)}</div>
 </section></main>
}