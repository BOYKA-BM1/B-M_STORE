import type { Metadata } from "next";

export const metadata: Metadata = { title: "عن المتجر" };

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl prose dark:prose-invert">
      <h1>عن B&M STORE</h1>
      <p>
        منصة لبيع المشاريع البرمجية الجاهزة. يمكنك تصفح المشاريع، تجربة الـ Demo
        عند توفره، والتواصل عبر واتساب للشراء أو طلب التخصيص.
      </p>
      <h2>كيف يعمل؟</h2>
      <ol>
        <li>تصفح المشاريع حسب التصنيف أو البحث</li>
        <li>افتح صفحة المشروع واطلع على المميزات والتقنيات</li>
        <li>جرّب الـ Demo إن وُجد</li>
        <li>اضغط «شراء عبر WhatsApp» وأكمل الطلب يدويًا</li>
      </ol>
    </div>
  );
}
