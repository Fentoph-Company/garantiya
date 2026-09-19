"use client";

import { FormEvent, useState } from "react";
import QRCode from "qrcode";

export default function SellerPage() {
  const [form, setForm] = useState({
    model: "",
    price: "",
    warrantyTo: "",
    ram: "",
    memory: "",
    product: "",
  });
  const [result, setResult] = useState<{ link: string; qr: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const r = await fetch("/api/warranties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || "Kafolat yaratilmadi.");
      }

      const link = new URL(d.link as string, window.location.origin).toString();
      const qr = await QRCode.toDataURL(link, {
        width: 520,
        margin: 2,
        errorCorrectionLevel: "H",
      });

      setResult({ link, qr });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <main className="seller-page">
        <div className="seller-shell">
          <header className="seller-topbar">
            <a className="brand" href="/">
              <b>G</b>
              garantiya
            </a>
            <button
              type="button"
              className="secondary-button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                location.href = "/login";
              }}
            >
              Tizimdan chiqish
            </button>
          </header>

          <section className="success-panel">
            <div className="success-icon">✓</div>
            <span className="eyebrow">Kafolat tayyor</span>
            <h1>Kafolat taloni muvaffaqiyatli yaratildi.</h1>
            <p className="success-lead">
              Xaridorga quyidagi QR kodni taqdim eting. QR kod skaner qilinganda
              kafolat taloni to‘g‘ridan-to‘g‘ri ochiladi.
            </p>

            <div className="qr-card">
              <div className="qr-frame">
                <img src={result.qr} alt="Kafolat QR kodi" className="qr-image" />
              </div>
              <div className="qr-status">
                <span>●</span> Kafolat havolasi faol
              </div>
              <div className="link-box">{result.link}</div>
            </div>

            <div className="notice-card">
              <strong>QR kodni xaridorga topshiring</strong>
              <p>
                Xaridor kafolatdan foydalanmoqchi bo‘lgan vaqtda ushbu QR kodni
                ko‘rsatishi kerak.
              </p>
            </div>

            <div className="warning-box">
              <strong>Diqqat:</strong> Siz (Do‘kon menejeri) ushbu kafolatni
              o‘chira olmaysiz. Noto‘g‘ri ma’lumot kiritilgan bo‘lsa, uni
              yaratishdan oldin tekshiring. Kafolat ma’lumotlari muddati
              tugagandan keyin boshqariladi.
            </div>

            <div className="result-actions">
              <button
                className="primary-button"
                onClick={() => navigator.clipboard.writeText(result.link)}
              >
                Havolani nusxalash
              </button>
              <a className="secondary-button" href={result.qr} download="kafolat-qr.png">
                QR kodni saqlash
              </a>
              <button className="secondary-button" onClick={() => setResult(null)}>
                Yangi kafolat
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="seller-page">
      <div className="seller-shell">
        <header className="seller-topbar">
          <a className="brand" href="/">
            <b>G</b>
            garantiya
          </a>
          <div className="seller-account">
            <span className="status-dot" />
            Do‘kon menejeri
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              location.href = "/login";
            }}
          >
            Tizimdan chiqish
          </button>
        </header>

        <div className="seller-heading">
          <div>
            <span className="eyebrow">KAFOLAT BOSHQARUVI</span>
            <h1>Yangi kafolat taloni</h1>
            <p>
              Mahsulot ma’lumotlarini kiriting. Boshlanish sanasi server vaqti
              bilan avtomatik belgilanadi.
            </p>
          </div>
          <div className="secure-badge">
            <span>✓</span>
            Ma’lumotlar himoyalangan
          </div>
        </div>

        <section className="warranty-form-card">
          <div className="form-card-head">
            <div>
              <span className="form-step">01</span>
              <div>
                <strong>Mahsulot ma’lumotlari</strong>
                <small>Asosiy ma’lumotlarni to‘ldiring</small>
              </div>
            </div>
            <span className="required-note">* Majburiy maydon</span>
          </div>

          <form className="seller-form" onSubmit={submit}>
            <label>
              <span>Mahsulot turi <i>*</i></span>
              <input
                required
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="Masalan: Telefon"
              />
            </label>

            <label>
              <span>Model <i>*</i></span>
              <input
                required
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Masalan: Galaxy A25"
              />
            </label>

            <label>
              <span>Narxi (UZS) <i>*</i></span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="2 500 000"
              />
            </label>

            <label>
              <span>Kafolat tugash sanasi <i>*</i></span>
              <input
                required
                type="date"
                value={form.warrantyTo}
                onChange={(e) => setForm({ ...form, warrantyTo: e.target.value })}
              />
              <small>Tanlangan sana kun oxirigacha amal qiladi.</small>
            </label>

            <div className="seller-divider">
              <span>Qo‘shimcha ma’lumotlar</span>
            </div>

            <label>
              <span>RAM <em>Ixtiyoriy</em></span>
              <input
                value={form.ram}
                onChange={(e) => setForm({ ...form, ram: e.target.value })}
                placeholder="8 GB"
              />
            </label>

            <label>
              <span>Xotira <em>Ixtiyoriy</em></span>
              <input
                value={form.memory}
                onChange={(e) => setForm({ ...form, memory: e.target.value })}
                placeholder="256 GB"
              />
            </label>

            {error && <div className="seller-error">{error}</div>}

            <div className="seller-submit">
              <div>
                <strong>Hammasi tayyormi?</strong>
                <small>Yaratilgandan so‘ng QR kod avtomatik hosil qilinadi.</small>
              </div>
              <button className="primary-button" disabled={loading}>
                {loading ? "Yaratilmoqda..." : "Kafolatni yaratish →"}
              </button>
            </div>
          </form>
        </section>

        <footer className="seller-footer">
          <span>garantiya · Ishonchli kafolat boshqaruvi</span>
          <span>Server vaqti bilan himoyalangan</span>
        </footer>
      </div>
    </main>
  );
}
