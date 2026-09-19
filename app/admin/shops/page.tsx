"use client";

import { useEffect, useState } from "react";

type ShopForm = { name: string; email: string; password: string; phone: string; address: string };

export default function ShopsPage() {
  const [form, setForm] = useState<ShopForm>({ name: "", email: "", password: "", phone: "", address: "" });
  const [created, setCreated] = useState<any>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/shops", { cache: "no-store" });
    if (r.ok) setShops(await r.json());
  }
  useEffect(() => { load(); }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setError(""); setCreated(null);
    const r = await fetch("/api/admin/shops", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const d = await r.json();
    if (!r.ok) { setError(d.error || "Do‘kon yaratilmadi."); return; }
    setCreated(d);
    setForm({ name: "", email: "", password: "", phone: "", address: "" });
    setShowPassword(false);
    load();
  }

  return (
    <section className="panel-content">
      <div className="panel-title">
        <div><span className="eyebrow">BOSHQARUV</span><h1>Do‘konlar</h1><p>Do‘konlarni yarating va ularning kirish ma’lumotlarini boshqaring.</p></div>
      </div>

      <div className="panel-grid">
        <section className="panel-card">
          <div className="panel-card-head"><div><strong>Yangi do‘kon</strong><small>Do‘kon menejeri uchun alohida hisob yarating.</small></div></div>
          <form className="panel-form" onSubmit={create}>
            <label>Do‘kon nomi<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
            <label>Login (elektron pochta)<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
            <label>Parol<div className="password-field"><input required minLength={8} maxLength={128} type={showPassword?"text":"password"} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><button type="button" className="password-toggle" onClick={()=>setShowPassword(!showPassword)}>{showPassword?"Yashirish":"Ko‘rsatish"}</button></div><small>Kamida 8 ta belgi.</small></label>
            <label>Telefon<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
            <label>Manzil<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
            {error && <div className="error-box">{error}</div>}
            <button className="primary-button">Do‘kon yaratish →</button>
          </form>
          {created && <div className="warning-box"><strong>Do‘kon yaratildi.</strong><br/>Login: {created.login}<br/>Parol xavfsiz hash ko‘rinishida saqlandi.</div>}
        </section>

        <section className="panel-card">
          <div className="panel-card-head"><div><strong>Mavjud do‘konlar</strong><small>Tizimdagi do‘konlar ro‘yxati.</small></div><span className="panel-count">{shops.length}</span></div>
          <div className="panel-list">
            {shops.length === 0 ? <div className="empty-state">Hozircha do‘kon mavjud emas.</div> : shops.map(s=><div className="panel-list-item" key={s.id}><div><strong>{s.name}</strong><small>{s.email}</small></div><span>{s.warrantyCount ?? 0} ta kafolat</span></div>)}
          </div>
        </section>
      </div>
    </section>
  );
}
