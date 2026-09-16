import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import {
  getPurchaseWhatsAppUrl,
  getCustomizationWhatsAppUrl,
} from "@/lib/whatsapp";
import { getProjectBySlugAsync, withDemoUrl } from "@/lib/data/store";
import { STORE_SETTINGS } from "@/lib/settings";
import { ExternalLink, MessageCircle, Settings2 } from "lucide-react";
import { WhatsAppTrackButton } from "@/components/store/whatsapp-track-button";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlugAsync(slug);
  if (!p || p.status !== "PUBLISHED") return { title: "مشروع غير موجود" };
  return {
    title: p.name,
    description: p.shortDescription,
    openGraph: { title: p.name, description: p.shortDescription, type: "website" },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const raw = await getProjectBySlugAsync(slug);
  if (!raw || raw.status !== "PUBLISHED") notFound();
  const project = withDemoUrl(raw);

  const productUrl = `${STORE_SETTINGS.appUrl}/projects/${slug}`;
  const purchaseUrl = getPurchaseWhatsAppUrl({
    projectName: project.name,
    projectId: project.id,
    price: formatPrice(project.priceEgp),
    productUrl,
  });
  const customUrl = getCustomizationWhatsAppUrl({
    projectName: project.name,
    projectId: project.id,
  });

  const demoUrl = project.demoUrl?.startsWith("http") ? project.demoUrl : `/d/${project.slug}/`;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <Badge variant="secondary" className="mb-3">
              {project.categoryName}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold">{project.name}</h1>
            <p className="mt-3 text-muted-foreground text-lg">{project.shortDescription}</p>
          </div>

          <div
            className="aspect-video rounded-2xl bg-gradient-to-br from-primary/15 via-muted to-purple-500/10 flex items-center justify-center text-muted-foreground border overflow-hidden"
            style={
              project.coverImageUrl
                ? {
                    backgroundImage: `url(${project.coverImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          >
            {!project.coverImageUrl && <span className="text-lg">صورة الغلاف</span>}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">الوصف</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {project.fullDescription}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">المميزات</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {project.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">التقنيات</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-sm text-muted-foreground space-y-1 border-t pt-4">
            <p>
              الإصدار: <span className="text-foreground">{project.version}</span>
            </p>
            {project.requirements && (
              <p>
                المتطلبات: <span className="text-foreground">{project.requirements}</span>
              </p>
            )}
            {project.framework && (
              <p>
                الإطار: <span className="text-foreground">{project.framework}</span>
              </p>
            )}
          </div>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-card p-6 space-y-5 shadow-sm">
            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-bold">{formatPrice(project.priceEgp)}</span>
                {project.oldPriceEgp && (
                  <span className="text-muted-foreground line-through text-lg">
                    {formatPrice(project.oldPriceEgp)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {project.demoMode !== "DISABLED" && (
                <Button className="w-full rounded-xl h-12 text-base" variant="secondary" asChild>
                  <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    تجربة Demo مباشرة
                  </a>
                </Button>
              )}

              <WhatsAppTrackButton href={purchaseUrl} projectId={project.id} type="purchase" className="w-full rounded-xl h-12 text-base">
                <MessageCircle className="h-4 w-4" />
                شراء عبر WhatsApp
              </WhatsAppTrackButton>

              <WhatsAppTrackButton
                href={customUrl}
                projectId={project.id}
                type="customization"
                variant="outline"
                className="w-full rounded-xl"
              >
                <Settings2 className="h-4 w-4" />
                طلب تخصيص
              </WhatsAppTrackButton>
            </div>

            <ul className="text-xs text-muted-foreground space-y-1.5 border-t pt-4">
              <li>✓ تواصل مباشر بدون وسطاء</li>
              <li>✓ رسالة شراء جاهزة تلقائيًا</li>
              <li>✓ إمكانية طلب تخصيص بعد المعاينة</li>
              {project.demoMode !== "DISABLED" && <li>✓ Demo مباشر قبل الشراء</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
