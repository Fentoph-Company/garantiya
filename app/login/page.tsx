"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login yoki parol noto‘g‘ri.");
        return;
      }

      if (data.mustChangePassword) {
        router.replace("/account/password");
        return;
      }

      router.replace(data.role === "ADMIN" ? "/admin" : "/seller");
    } catch {
      setError("Server bilan bog‘lanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <a className="brand auth-brand" href="/">
          <b>G</b>garantiya
        </a>

        <form onSubmit={submit} className="auth-card login-card">
          <div className="eyebrow">SHAXSIY KABINET</div>
          <h1>Tizimga kirish</h1>
          <p>
            Admin yoki do‘kon uchun berilgan login va parol orqali
            hisobingizga kiring.
          </p>

          <div className="login-fields">
            <label>
              <span>Login / e-mail</span>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.uz"
              />
            </label>

            <label>
              <span>Parol</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolingizni kiriting"
              />
            </label>
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="btn dark login-submit" type="submit" disabled={loading}>
            {loading ? "Tekshirilmoqda..." : "Kirish →"}
          </button>

          <div className="login-note">
            <strong>Eslatma</strong>
            <p>
              Login va parollar admin tomonidan har bir do‘kon uchun alohida
              beriladi.
            </p>
          </div>
        </form>

        <a className="back-home" href="/">← Bosh sahifaga qaytish</a>
      </div>
    </main>
  );
}
