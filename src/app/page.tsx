import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/store/project-card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Zap, Headphones, Code2, Search } from "lucide-react";
import { getFeaturedProjectsAsync } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await getFeaturedProjectsAsync();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 hero-gradient opacity-[0.08] dark:opacity-[0.15]" />
        <div className="absolute -top-24 -end-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 -start-24 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 md:py-28 text-center">
          <Badge className="mb-5 rounded-full px-4 py-1.5" variant="secondary">
            متجر مشاريع برمجية جاهزة للإنتاج
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl mx-auto leading-[1.35] space-y-2">
            <span className="block">اشترِ مشاريع برمجية</span>
            <span className="block bg-gradient-to-l from-primary to-purple-500 bg-clip-text text-transparent pb-1">
              جاهزة للانطلاق
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            تصفح مشاريع احترافية، جرّب الـ Demo، واطلب الشراء أو التخصيص عبر واتساب في دقائق.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-12 px-8 rounded-xl shadow-lg shadow-primary/25" asChild>
              <Link href="/projects">
                تصفح المشاريع
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 rounded-xl" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                بحث متقدم
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">مشاريع مميزة</h2>
            <p className="text-muted-foreground text-sm mt-1">الأكثر طلبًا من العملاء</p>
          </div>
          <Button variant="ghost" className="rounded-xl" asChild>
            <Link href="/projects">عرض الكل</Link>
          </Button>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-2xl border bg-card p-10 text-center text-muted-foreground">
            لا توجد مشاريع مميزة حاليًا — تصفح كل المشاريع أو عد لاحقًا.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <ProjectCard
                key={p.slug}
                slug={p.slug}
                name={p.name}
                shortDescription={p.shortDescription}
                priceEgp={p.priceEgp}
                oldPriceEgp={p.oldPriceEgp}
                coverImageUrl={p.coverImageUrl}
                technologies={p.technologies}
                demoAvailable={p.demoMode !== "DISABLED" && !!p.demoUrl}
                categoryName={p.categoryName}
                viewCount={p.viewCount}
              />
            ))}
          </div>
        )}
      </section>

      

      {/* Why */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">لماذا B&M STORE؟</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Code2, title: "كود إنتاجي", desc: "مشاريع مكتوبة بمعايير حقيقية وليست تجريبية" },
            { icon: Zap, title: "Demo مباشر", desc: "جرّب قبل الشراء عند توفر العرض التجريبي" },
            { icon: Shield, title: "ثقة وأمان", desc: "مصادر مفحوصة وتواصل مباشر عبر واتساب" },
            { icon: Headphones, title: "تخصيص", desc: "اطلب تعديلات تناسب احتياجك بسهولة" },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border bg-card p-6 text-center space-y-3 card-hover">
              <div className="mx-auto w-14 h-14 rounded-2xl hero-gradient flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="rounded-3xl hero-gradient p-10 md:p-14 text-center text-white shadow-2xl shadow-primary/30">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">جاهز تختار مشروعك؟</h2>
            <p className="opacity-90 mb-8 max-w-xl mx-auto text-lg">
              تصفح المشاريع واضغط شراء عبر واتساب — الرسالة تُجهَّز تلقائيًا.
            </p>
            <Button size="lg" variant="secondary" className="h-12 px-8 rounded-xl font-semibold" asChild>
              <Link href="/projects">عرض كل المشاريع</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
