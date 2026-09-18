import type { Metadata } from "next";
import "./globals.css";
import SiteInsights from "./SiteInsights";
import YandexMetrica from "./YandexMetrica";
export const metadata: Metadata={title:"Garantiya — Kafolatni raqamlashtiring",description:"Kafolatlarni saqlash, tekshirish va servis jarayonlarini yagona raqamli platformada boshqaring."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}<SiteInsights/><YandexMetrica/></body></html>}