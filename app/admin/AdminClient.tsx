"use client";

import AdminPathSettings from "./AdminPathSettings";
import { useEffect, useState } from "react";

type ShopForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
};

export default function Admin() {
  const [shops, setShops] = useState<ShopForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [created, setCreated] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/warranties", { cache: "no-store" });
    if (r.ok) setItems(await r.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: any) {
    e.preventDefault();
    setError("");
    setCreated(null);

    const r = await fetch("/api/admin/shops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shops),
    });

    const d = await r.json();

    if (!r.ok) {
      setError(d.error);
      return;
    }

    setCreated(d);
    setShops({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    });
    setShowPassword(false);
  }

  async function del(id: string) {
    if (!confirm("Ushbu kafolatni o‘chirishni tasdiqlaysizmi?")) return;
    await fetch("/api/admin/warranties?id=" + id, { method: "DELETE" });
    load();
  }

  return (
    <main className="auth-page">
      <section className="auth-card wide-card">
        <span className="eyebrow">Administrator paneli</span>
        <h1>Boshqaruv markazi</h1>

        <AdminPathSettings />

        <div className="button-row">
          <button
            className="secondary-button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              location.href = "/login";
            }}
          >
            Tizimdan chiqish
          </button>
        </div>

        <p>Do‘konlar va kafolat yozuvlarini boshqaring.</p>

        <h2>Yangi do‘kon</h2>

        <form className="form-grid" onSubmit={create}>
          <label>
            Do‘kon nomi
            <input
              required
              value={shops.name}
              onChange={(e) => setShops({ ...shops, name: e.target.value })}
            />
          </label>

          <label>
            Login (elektron pochta)
            <input
              required
              type="email"
              value={shops.email}
              onChange={(e) => setShops({ ...shops, email: e.target.value })}
            />
          </label>

          <label>
            Parol
            <div className="password-field">
              <input
                required
                minLength={8}
                maxLength={128}
                type={showPassword ? "text" : "password"}
                value={shops.password}
                onChange={(e) =>
                  setShops({ ...shops, password: e.target.value })
                }
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? "Yashirish" : "Ko‘rsatish"}
              </button>
            </div>
            <small>Kamida 8 ta belgi.</small>
          </label>

          <label>
            Telefon
            <input
              value={shops.phone}
              onChange={(e) => setShops({ ...shops, phone: e.target.value })}
            />
          </label>

          <label>
            Manzil
            <input
              value={shops.address}
              onChange={(e) => setShops({ ...shops, address: e.target.value })}
            />
          </label>

          <button className="primary-button form-submit" type="submit">
            Do‘kon yaratish
          </button>
        </form>

        {error && <div className="error-box">{error}</div>}

        {created && (
          <div className="warning-box">
            <strong>Do‘kon yaratildi.</strong>
            <br />
            Login: {created.login}
            <br />
            Belgilangan parol xavfsiz tarzda saqlangan.
            <br />
            Sotuvchi birinchi kirishda parolini almashtiradi.
          </div>
        )}

        <h2 style={{ marginTop: 40 }}>Kafolatlar</h2>

        <div>
          {items.map((w) => (
            <div
              key={w.id}
              className="link-box"
              style={{ marginBottom: 10 }}
            >
              <strong>
                {w.product} — {w.model}
              </strong>
              <br />
              Do‘kon: {w.shop.name} · Narx: {w.price} UZS · Tugash:{" "}
              {new Date(w.warrantyTo).toLocaleDateString("uz-UZ")}
              <br />
              {new Date(w.warrantyTo) <= new Date() ? (
                <button
                  className="secondary-button"
                  onClick={() => del(w.id)}
                >
                  O‘chirish
                </button>
              ) : (
                <span style={{ fontSize: 12, color: "#888" }}>
                  Faol — o‘chirish mumkin emas
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
