import Link from "next/link";
import { ProjectCard } from "@/components/store/project-card";
import { getPublishedProjectsAsync } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { PackageOpen, Search } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "كل المشاريع",
  description: "تصفح جميع المشاريع البرمجية المتاحة للبيع في B&M STORE",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublishedProjectsAsync();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">كل المشاريع</h1>
          <p className="text-muted-foreground mt-2">
            {projects.length > 0
              ? `${projects.length} مشروع متاح حاليًا`
              : "لا توجد مشاريع منشورة بعد"}
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" asChild>
          <Link href="/search">
            <Search className="h-4 w-4 me-2" />
            بحث متقدم
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border bg-card p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">المتجر جاهز لاستقبال المشاريع</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            قريبًا هتلاقي هنا مشاريع برمجية جاهزة للإنتاج مع Demo مباشر وطلب شراء عبر واتساب.
          </p>
          <Button className="rounded-xl" asChild>
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
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
    </div>
  );
}
