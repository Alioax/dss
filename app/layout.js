// app\layout.js

import "./globals.css";
import { Vazirmatn } from "next/font/google";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-vazirmatn",
});


export const metadata = {
  title: "پشتیبان شبکه",
  description: "در حال توسعه",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        className={`${vazirmatn.variable} font-sans min-h-dvh flex flex-col`}
      >
        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Global Footer */}
        <footer className="text-xs text-slate-500 text-center py-4">
          © ۲۰۲۵ نام گروه. تمامی حقوق محفوظ است. • نسخه پیش‌انتشار
        </footer>
      </body>
    </html>
  );
}