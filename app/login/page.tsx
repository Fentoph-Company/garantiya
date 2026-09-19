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
        setError(data.error || "Kirish amalga oshmadi.");
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
      <form onSubmit={submit} className="auth-card">
        <a className="brand" href="/">
          <b>G</b>garantiya
        </a>

        <h1>Administratorga kirish</h1>
        <p>
          Admin e-mail manzilingiz va parolingiz bilan kiring. Hisobga
          muvaffaqiyatli kirgandan keyin administrator huquqlari avtomatik
          tekshiriladi.
        </p>

        <label>
          Admin e-mail
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
          Admin parol
          <input
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolingiz"
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="btn dark" type="submit" disabled={loading}>
          {loading ? "Tekshirilmoqda..." : "Kirish →"}
        </button>
      </form>
    </main>
  );
}
