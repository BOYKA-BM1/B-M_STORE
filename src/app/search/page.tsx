import type { Metadata } from "next";
import { ProjectCard } from "@/components/store/project-card";
import { searchProjectsAsync } from "@/lib/data/store";
import { isAdminSearchQuery } from "@/lib/admin-auth";
import { AdminGate } from "@/components/admin/admin-gate";

export const metadata: Metadata = { title: "بحث" };
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  // Secret: typing 13/4/2024 reveals admin login gate (not public link)
  if (query && isAdminSearchQuery(query)) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <AdminGate />
      </div>
    );
  }

  const results = query ? await searchProjectsAsync(query) : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">بحث في المشاريع</h1>
      <p className="text-muted-foreground text-sm mb-8">ابحث بالاسم أو التقنية أو التصنيف</p>

      <form className="mb-10" action="/search" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="مثال: Next.js أو عيادة أو متجر..."
          className="search-box max-w-2xl"
          autoFocus
        />
      </form>

      {query ? (
        <>
          <p className="text-muted-foreground text-sm mb-6">
            نتائج «{query}»: <strong className="text-foreground">{results.length}</strong>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((p) => (
              <ProjectCard
                key={p.slug}
                slug={p.slug}
                name={p.name}
                shortDescription={p.shortDescription}
                priceEgp={p.priceEgp}
                oldPriceEgp={p.oldPriceEgp}
                technologies={p.technologies}
                demoAvailable={p.demoMode !== "DISABLED" && !!p.demoUrl}
                categoryName={p.categoryName}
                viewCount={p.viewCount}
              />
            ))}
          </div>
          {results.length === 0 && (
            <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
              لا توجد نتائج مطابقة لبحثك
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
          اكتب كلمة في مربع البحث للبدء
        </div>
      )}
    </div>
  );
}
