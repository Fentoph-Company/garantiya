import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Warranty({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const w = await prisma.warranty.findUnique({
    where: { publicToken: token },
    include: {
      shop: {
        select: { name: true, phone: true, address: true },
      },
    },
  });

  if (!w || w.deletedAt) {
    redirect("/403");
  }

  const now = new Date();
  const expired = now > w.warrantyTo;
  const totalMs = Math.max(w.warrantyTo.getTime() - w.startingDate.getTime(), 1);
  const elapsedMs = Math.min(
    Math.max(now.getTime() - w.startingDate.getTime(), 0),
    totalMs,
  );
  const progress = Math.max(0, Math.min(100, 100 - (elapsedMs / totalMs) * 100));

  return (
    <main className="warranty-page">
      <div className="warranty-glow warranty-glow-one" />
      <div className="warranty-glow warranty-glow-two" />

      <div className="warranty-shell">
        <header className="warranty-topbar">
          <a className="brand" href="/">
            <img className="brand-mark" src="/icon.svg" alt="garantiya" />garantiya
          </a>
          <span className="warranty-top-label">KAFOLATNI TEKSHIRISH</span>
        </header>

        <section className="warranty-card">
          <div className="warranty-card-head">
            <div>
              <small>RAQAMLI KAFOLAT KARTASI</small>
              <div className={"warranty-status " + (expired ? "expired" : "active")}>
                <span>{expired ? "●" : "●"}</span>
                {expired ? "KAFOLAT MUDDATI TUGAGAN" : "KAFOLAT FAOL"}
              </div>
            </div>
            <div className="warranty-mark">G</div>
          </div>

          <div className="warranty-product">
            <div className="warranty-product-icon">G</div>
            <div>
              <h1>{w.product}</h1>
              <p>{w.model}</p>
            </div>
            <span className="warranty-chip">{expired ? "Tugagan" : "Faol"}</span>
          </div>

          <div className="warranty-progress">
            <div className="warranty-progress-label">
              <span>Kafolat muddati</span>
              <b>{Math.round(progress)}%</b>
            </div>
            <div className="warranty-progress-bar">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="warranty-dates">
              <span>{w.startingDate.toLocaleDateString("uz-UZ")}</span>
              <span>{w.warrantyTo.toLocaleDateString("uz-UZ")} gacha</span>
            </div>
          </div>

          <div className="warranty-info-grid">
            <div>
              <small>Narx</small>
              <b>{Number(w.price).toLocaleString("uz-UZ")} {w.currency}</b>
            </div>
            <div>
              <small>Do‘kon</small>
              <b>{w.shop.name}</b>
            </div>
            <div>
              <small>Boshlangan sana</small>
              <b>{w.startingDate.toLocaleDateString("uz-UZ")}</b>
            </div>
            <div>
              <small>Kafolatgacha</small>
              <b>{w.warrantyTo.toLocaleDateString("uz-UZ")}</b>
            </div>
          </div>

          <div className="warranty-specs">
            <span>RAM: <b>{w.ram || "—"}</b></span>
            <span>Xotira: <b>{w.memory || "—"}</b></span>
          </div>

          <div className="warranty-notice">
            <strong>✓ Kafolat ma’lumoti tasdiqlangan</strong>
            <p>
              Ushbu sahifa kafolat ma’lumotlarini tekshirish uchun yaratilgan.
              Kafolatdan foydalanishda QR kodni servis xodimiga ko‘rsating.
            </p>
          </div>
        </section>

        <p className="warranty-footer">
          Raqamli kafolat · Ma’lumotlar tizim orqali tekshirildi
        </p>
      </div>
    </main>
  );
}
