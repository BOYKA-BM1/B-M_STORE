import { notFound } from "next/navigation";
import { ProjectCard } from "@/components/store/project-card";
import { getProjectsByCategoryAsync, CATEGORIES } from "@/lib/data/store";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  return { title: cat ? cat.name : "تصنيف" };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) notFound();
  const projects = await getProjectsByCategoryAsync(slug);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-foreground">
          ← كل المشاريع
        </Link>
        <h1 className="text-3xl font-bold mt-2">{cat.name}</h1>
        <p className="text-muted-foreground mt-1">{projects.length} مشروع</p>
      </div>
      {projects.length === 0 ? (
        <p className="text-muted-foreground">لا توجد مشاريع في هذا التصنيف حاليًا.</p>
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
