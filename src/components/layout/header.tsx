"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "الرئيسية" },
  { href: "/projects", label: "المشاريع" },
  { href: "/search", label: "بحث" },
  { href: "/about", label: "عن المتجر" },
  { href: "/contact", label: "تواصل" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  }

  function clearSearch() {
    setQ("");
  }

  return (
    <header className="sticky top-0 z-50 w-full glass shadow-sm">
      {/* dir=ltr عشان اللوجو شمال والقائمة يمين بوضوح */}
      <div
        dir="ltr"
        className="flex h-16 w-full items-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6"
      >
        {/* اللوجو — أقصى الشمال، الأيقونة قبل الاسم */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          onClick={() => setMenuOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl hero-gradient text-white font-black text-xs shadow-md shadow-primary/30 tracking-tighter">
            B&M
          </span>
          <div className="leading-tight text-start" dir="rtl">
            <div className="font-bold text-sm sm:text-base tracking-tight">
              B&M STORE
            </div>
            <div className="text-[9px] sm:text-[10px] text-muted-foreground whitespace-nowrap">
              متجر المشاريع البرمجية
            </div>
          </div>
        </Link>

        {/* البحث — في المنتصف */}
        <form
          onSubmit={onSearch}
          className="hidden md:flex flex-1 justify-center max-w-xl mx-auto"
          dir="rtl"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مشروع أو تقنية..."
              className="w-full h-11 rounded-2xl border-2 border-border bg-card text-sm shadow-sm
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary
                ps-11 pe-11"
              aria-label="بحث"
            />
            {q.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute end-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full
                  flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="مسح البحث"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {/* مساحة مرنة على الموبايل عشان القائمة تفضل يمين */}
        <div className="flex-1 md:hidden" />

        {/* زر القائمة — أقصى اليمين، أيقونة فقط وكبيرة */}
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl h-11 w-11 border-2 shrink-0"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="القائمة"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* موبايل بحث */}
      <div className="px-3 sm:px-4 pb-3 md:hidden" dir="rtl">
        <form onSubmit={onSearch}>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مشروع..."
              className="w-full h-11 rounded-2xl border-2 border-border bg-card text-sm ps-10 pe-10
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            {q.length > 0 && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full
                  flex items-center justify-center text-muted-foreground hover:bg-muted"
                aria-label="مسح"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {menuOpen && (
        <div className="border-t bg-card/95 backdrop-blur-xl shadow-lg" dir="rtl">
          <nav className="px-4 py-4 flex flex-col gap-1 max-w-3xl">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-3 text-base font-medium transition-colors
                  ${pathname === item.href ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t my-2" />
            <button
              type="button"
              className="rounded-xl px-4 py-3 text-start text-base font-medium hover:bg-muted flex items-center gap-3 w-full"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </span>
              تبديل الوضع الداكن / الفاتح
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
