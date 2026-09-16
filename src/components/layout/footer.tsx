import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg hero-gradient text-white font-black text-xs">
                B&M
              </span>
              <span className="font-bold">B&M STORE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              متجر احترافي لبيع المشاريع البرمجية الجاهزة مع تجربة Demo وطلبات واتساب.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">روابط</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/projects" className="hover:text-primary transition-colors">كل المشاريع</Link></li>
              <li><Link href="/search" className="hover:text-primary transition-colors">بحث</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">عن المتجر</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">الدعم</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">تواصل واتساب</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">قانوني</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="cursor-default">الخصوصية</span></li>
              <li><span className="cursor-default">الشروط</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} B&M STORE — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
