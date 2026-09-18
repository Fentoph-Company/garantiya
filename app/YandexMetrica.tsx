"use client";

import Script from "next/script";

export default function YandexMetrica() {
  const id = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;

  if (!id) return null;

  const scriptSrc = `https://mc.yandex.ru/metrika/tag.js?id=${encodeURIComponent(id)}`;
  const imageSrc = `https://mc.yandex.ru/watch/${encodeURIComponent(id)}`;

  return (
    <>
      <Script
        id="yandex-metrica-loader"
        strategy="afterInteractive"
        src={scriptSrc}
        onLoad={() => {
          const w = window as unknown as {
            ym?: ((...args: unknown[]) => void) & { a?: unknown[] };
          };

          w.ym =
            w.ym ||
            Object.assign(
              (...args: unknown[]) => {
                w.ym!.a = w.ym!.a || [];
                w.ym!.a.push(args);
              },
              { a: [] },
            );

          w.ym(Number(id), "init", {
            ssr: true,
            webvisor: true,
            clickmap: true,
            accurateTrackBounce: true,
            trackLinks: true,
            ecommerce: "dataLayer",
          });
        }}
      />
      <noscript>
        <div>
          <img
            src={imageSrc}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
