# Garantiya

O‘zbek tilidagi raqamli kafolat platformasi.

## Asosiy imkoniyatlar
- Administrator va do‘kon menejeri rollari
- Har bir do‘kon uchun alohida hisob
- Server vaqti asosida kafolat boshlanish sanasi
- Noyob kafolat havolasi va QR-kod
- Ochiq kafolat tekshirish sahifasi
- Admin boshqaruvi va audit jurnali
- Faol kafolatni do‘kon menejeri o‘chira olmaydi
- Muddati tugagan kafolatni admin o‘chirish jarayoniga yuborishi mumkin
- Maxfiylik siyosati va foydalanish shartlari

## Ishga tushirish

1. Node.js o‘rnating.
2. npm install
3. .env.example asosida .env yarating.
4. npx prisma db push
5. npm run db:seed
6. npm run dev

Ishlab chiqarish muhitida HTTPS, kuchli AUTH_SECRET, kuchli admin paroli va himoyalangan PostgreSQL ulanishidan foydalaning.

## Muhim
.env faylini GitHub'ga yuklamang. Haqiqiy maxfiy kalitlar va parollar faqat server muhitida saqlanishi kerak.

## Huquqiy hujjatlar
/privacy — Maxfiylik siyosati
/terms — Foydalanish shartlari

Huquqiy hujjatlarni ishga tushirishdan oldin O‘zbekiston qonunchiligiga mosligi bo‘yicha yurist tomonidan tekshirtirish tavsiya etiladi.
