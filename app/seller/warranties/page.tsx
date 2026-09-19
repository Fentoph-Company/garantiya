"use client";
import {useEffect,useState} from "react";
export default function SellerWarrantiesPage(){
 const [items,setItems]=useState<any[]>([]);
 useEffect(()=>{fetch("/api/warranties",{cache:"no-store"}).then(r=>r.ok?r.json():[]).then(setItems)},[]);
 return <section className="panel-content seller-warranty-content"><div className="panel-title"><div><span className="eyebrow">DO‘KON</span><h1>Do‘kondagi garantiyalar</h1><p>Siz yaratgan barcha kafolat talonlari shu yerda.</p></div><span className="panel-count large">{items.length}</span></div><div className="panel-card"><div className="panel-list">{items.length===0?<div className="empty-state">Hozircha kafolat taloni mavjud emas.</div>:items.map(w=><div className="warranty-row" key={w.id}><div><strong>{w.product} — {w.model}</strong><small>{Number(w.price).toLocaleString("uz-UZ")} UZS · Boshlangan: {new Date(w.startingDate).toLocaleDateString("uz-UZ")}</small></div><div className="warranty-meta"><span>{new Date(w.warrantyTo).toLocaleDateString("uz-UZ")}</span><a className="secondary-button" href={"/w/"+w.publicToken}>Ko‘rish</a></div></div>)}</div></div></section>
}