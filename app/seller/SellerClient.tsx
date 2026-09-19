"use client";
import { FormEvent, useState } from "react";
import QRCode from "qrcode";

export default function SellerPage() {
  const [form,setForm]=useState({model:"",price:"",warrantyTo:"",ram:"",memory:"",product:""});
  const [result,setResult]=useState<{link:string;qr:string}|null>(null);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  async function submit(e:FormEvent){
    e.preventDefault(); setError(""); setLoading(true);
    try{
      const r=await fetch("/api/warranties",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const d=await r.json(); if(!r.ok) throw new Error(d.error||"Kafolat yaratilmadi.");
      const relativeLink=d.link as string;
      const link=new URL(relativeLink,window.location.origin).toString();
      const qr=await QRCode.toDataURL(link,{width:520,margin:2,errorCorrectionLevel:"H"});
      setResult({link,qr});
    }catch(e){setError(e instanceof Error?e.message:"Xatolik yuz berdi.");}
    finally{setLoading(false);}
  }
  if(result) return <main className="auth-page"><section className="auth-card qr-result">
    <span className="eyebrow">Kafolat tayyor</span><h1>Kafolat taloni muvaffaqiyatli yaratildi.</h1>
    <img src={result.qr} alt="Kafolat QR kodi" className="qr-image"/>
    <div className="link-box">{result.link}</div>
    <p><strong>Bu QR kodni xaridorga topshirib qo‘ying.</strong> U kafolatdan foydalanmoqchi bo‘lgan vaqtda shu QR kodni ko‘rsatishi lozim.</p>
    <div className="warning-box"><strong>Diqqat:</strong> Siz (Do‘kon menejeri) ushbu kafolatni o‘chira olmaysiz. Shuning uchun hech qanday noto‘g‘ri ma’lumot kiritmang. Ushbu ma’lumotlar faqat kafolat muddati tugaganidan keyin o‘chiriladi.</div>
    <div className="button-row"><button className="primary-button" onClick={()=>navigator.clipboard.writeText(result.link)}>Havolani nusxalash</button><a className="secondary-button" href={result.qr} download="kafolat-qr.png">QR kodni saqlash</a><button className="secondary-button" onClick={()=>setResult(null)}>Yangi kafolat</button></div>
  </section></main>;
  return <main className="auth-page"><section className="auth-card wide-card"><div className="button-row"><button type="button" className="secondary-button" onClick={async()=>{await fetch("/api/auth/logout",{method:"POST"});location.href="/login"}}>Tizimdan chiqish</button></div><span className="eyebrow">Do‘kon menejeri</span><h1>Yangi kafolat taloni</h1><p>Mahsulot ma’lumotlarini aniq kiriting. Boshlanish sanasi server vaqti bilan avtomatik belgilanadi.</p>
    <form className="form-grid" onSubmit={submit}>
      <label>Mahsulot turi<input required value={form.product} onChange={e=>setForm({...form,product:e.target.value})} placeholder="Masalan: Telefon"/></label>
      <label>Model<input required value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Masalan: Galaxy S25"/></label>
      <label>Narxi (UZS)<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label>
      <label>Kafolat tugash sanasi<input required type="date" value={form.warrantyTo} onChange={e=>setForm({...form,warrantyTo:e.target.value})}/></label>
      <label>RAM <span>(ixtiyoriy)</span><input value={form.ram} onChange={e=>setForm({...form,ram:e.target.value})} placeholder="8 GB"/></label>
      <label>Xotira <span>(ixtiyoriy)</span><input value={form.memory} onChange={e=>setForm({...form,memory:e.target.value})} placeholder="256 GB"/></label>
      {error&&<div className="error-box">{error}</div>}
      <button className="primary-button form-submit" disabled={loading}>{loading?"Yaratilmoqda...":"Kafolatni yaratish"}</button>
    </form>
  </section></main>;
}