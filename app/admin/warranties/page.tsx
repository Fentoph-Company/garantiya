"use client";

import { useEffect, useState } from "react";

export default function WarrantiesPage() {
  const [items,setItems]=useState<any[]>([]);
  const [error,setError]=useState("");

  async function load(){const r=await fetch("/api/admin/warranties",{cache:"no-store"});if(r.ok)setItems(await r.json());else setError("Kafolatlarni yuklashda xatolik.");}
  useEffect(()=>{load()},[]);

  async function del(id:string){if(!confirm("Ushbu kafolatni o‘chirishni tasdiqlaysizmi?"))return;const r=await fetch("/api/admin/warranties?id="+id,{method:"DELETE"});if(!r.ok){const d=await r.json();setError(d.error||"O‘chirilmadi.");return}load();}

  return <section className="panel-content">
    <div className="panel-title"><div><span className="eyebrow">BOSHQARUV</span><h1>Garantiya talonlar</h1><p>Barcha do‘konlardagi kafolat yozuvlarini nazorat qiling.</p></div><span className="panel-count large">{items.length}</span></div>
    {error&&<div className="error-box">{error}</div>}
    <div className="panel-card"><div className="panel-list">
      {items.length===0?<div className="empty-state">Hozircha kafolat talonlari mavjud emas.</div>:items.map(w=><div className="warranty-row" key={w.id}>
        <div><strong>{w.product} — {w.model}</strong><small>{w.shop?.name||"Do‘kon"} · {Number(w.price).toLocaleString("uz-UZ")} UZS</small></div>
        <div className="warranty-meta"><span>{new Date(w.warrantyTo).toLocaleDateString("uz-UZ")}</span>{new Date(w.warrantyTo)<=new Date()?<button className="secondary-button" onClick={()=>del(w.id)}>O‘chirish</button>:<small>Faol</small>}</div>
      </div>)}
    </div></div>
  </section>;
}
