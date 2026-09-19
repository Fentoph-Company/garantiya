"use client";

import { FormEvent, useState } from "react";

type Action = "grant_admin" | "delete_warranties" | "delete_shops";

export default function DangerZonePage() {
  const [password, setPassword] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState<Action | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function run(action: Action, event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (action !== "grant_admin" && !window.confirm(
      action === "delete_shops"
        ? "Barcha do‘konlar, barcha do‘kon xodimlari va barcha garantiya talonlari ma’lumotlar bazasidan butunlay o‘chiriladi. Bu amalni ortga qaytarib bo‘lmaydi. Davom etasizmi?"
        : "Barcha garantiya talonlari ma’lumotlar bazasidan butunlay o‘chiriladi. Bu amalni ortga qaytarib bo‘lmaydi. Davom etasizmi?"
    )) return;

    setBusy(action);
    try {
      const res = await fetch("/api/admin/danger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ action, password, targetEmail, confirmation }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Amal bajarilmadi.");
        return;
      }

      if (action === "grant_admin") {
        setMessage(data.message);
      } else if (action === "delete_shops") {
        setMessage(`${data.shops} ta do‘kon, ${data.sellers} ta xodim va ${data.warranties} ta garantiya taloni butunlay o‘chirildi.`);
      } else {
        setMessage(`${data.deleted} ta garantiya taloni butunlay o‘chirildi.`);
      }

      setConfirmation("");
    } catch {
      setError("Server bilan aloqa amalga oshmadi.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="panel-content danger-zone-page">
      <div className="panel-title">
        <div>
          <span className="eyebrow">YUQORI XAVF</span>
          <h1>Xavfli hudud</h1>
          <p>Bu yerdagi amallar tizim ma’lumotlariga bevosita ta’sir qiladi.</p>
        </div>
      </div>

      <div className="danger-warning">
        <strong>Diqqat: bu amallarni qaytarib bo‘lmaydi.</strong>
        <p>
          O‘chirish ishlari faqat serverda, administrator paroli va aniq tasdiqlash
          matni bilan bajariladi. Faqat tugmani bosishning o‘zi yetarli emas.
        </p>
      </div>

      {(error || message) && (
        <div className={error ? "error-box" : "success-box"}>{error || message}</div>
      )}

      <div className="danger-grid">
        <section className="danger-card danger-card-admin">
          <div className="danger-card-head">
            <span className="danger-icon">+</span>
            <div>
              <strong>Admin huquqini boshqaga berish</strong>
              <small>Amaldagi administrator huquqi saqlanadi.</small>
            </div>
          </div>
          <form className="panel-form" onSubmit={(e) => run("grant_admin", e)}>
            <label>
              Foydalanuvchi logini
              <input value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} type="email" placeholder="login@example.uz" required />
            </label>
            <label>
              Joriy admin paroli
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button className="primary-button" disabled={busy !== null}>
              {busy === "grant_admin" ? "Bajarilmoqda..." : "Admin huquqini berish"}
            </button>
          </form>
        </section>

        <section className="danger-card">
          <div className="danger-card-head">
            <span className="danger-icon">!</span>
            <div>
              <strong>Garantiya talonlarini barchasini tozalash</strong>
              <small>Barcha Warranty yozuvlari bazadan fizik o‘chiriladi.</small>
            </div>
          </div>
          <form className="panel-form" onSubmit={(e) => run("delete_warranties", e)}>
            <label>
              Tasdiqlash matni
              <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="GARANTIYALARNI TO‘LIQ O‘CHIRISH" required />
            </label>
            <label>
              Joriy admin paroli
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button className="danger-button" disabled={busy !== null}>
              {busy === "delete_warranties" ? "O‘chirilmoqda..." : "Barcha garantiya talonlarini o‘chirish"}
            </button>
          </form>
        </section>

        <section className="danger-card danger-card-critical">
          <div className="danger-card-head">
            <span className="danger-icon">×</span>
            <div>
              <strong>Do‘konlarni barchasini tozalash</strong>
              <small>Do‘konlar + xodimlar + ularga tegishli barcha garantiya talonlari o‘chadi.</small>
            </div>
          </div>
          <form className="panel-form" onSubmit={(e) => run("delete_shops", e)}>
            <label>
              Tasdiqlash matni
              <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="DO‘KONLARNI TO‘LIQ O‘CHIRISH" required />
            </label>
            <label>
              Joriy admin paroli
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
            </label>
            <button className="danger-button" disabled={busy !== null}>
              {busy === "delete_shops" ? "O‘chirilmoqda..." : "Barcha do‘konlarni o‘chirish"}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
