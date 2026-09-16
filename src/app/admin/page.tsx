import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Eye,
  MessageCircle,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  Plus,
  LogOut,
} from "lucide-react";
import { getAllProjects, getPublishedProjectsAsync } from "@/lib/data/store";
import { getWhatsAppNumber } from "@/lib/settings";
import { AdminLogoutButton } from "@/components/admin/logout-button";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const all = await getAllProjects();
  const published = await getPublishedProjectsAsync();
  const drafts = all.filter((p) => p.status === "DRAFT");
  const withDemo = published.filter((p) => p.demoMode !== "DISABLED");
  const totalViews = published.reduce((s, p) => s + p.viewCount, 0);
  const totalWa = published.reduce((s, p) => s + p.whatsappClicks, 0);
  const topViewed = [...published].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

  const stats = [
    { label: "إجمالي المشاريع", value: String(all.length), icon: FolderKanban },
    { label: "منشورة", value: String(published.length), icon: CheckCircle2 },
    { label: "مسودات", value: String(drafts.length), icon: AlertCircle },
    { label: "مع Demo", value: String(withDemo.length), icon: PlayCircle },
    { label: "مشاهدات", value: totalViews.toLocaleString("ar-EG"), icon: Eye },
    { label: "نقرات واتساب", value: totalWa.toLocaleString("ar-EG"), icon: MessageCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-1">
            واتساب الطلبات:{" "}
            <span className="font-mono text-foreground" dir="ltr">
              {getWhatsAppNumber()}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="lg" className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20">
            <Link href="/admin/projects/new">
              <Plus className="h-5 w-5" />
              رفع / إضافة مشروع جديد
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/admin/projects">كل المشاريع</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link href="/">عرض المتجر</Link>
          </Button>
          <AdminLogoutButton />
        </div>
      </div>

      {/* Big CTA */}
      <Link
        href="/admin/projects/new"
        className="mb-10 flex items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-6 hover:bg-primary/10 hover:border-primary transition-all group"
      >
        <div>
          <div className="font-bold text-lg group-hover:text-primary transition-colors">
            إضافة مشروع جديد للمتجر
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            الوصف والتقنيات تُملأ تلقائيًا حسب التصنيف — ثم احفظ ليظهر للعملاء
          </p>
        </div>
        <div className="h-12 w-12 rounded-xl hero-gradient text-white flex items-center justify-center shrink-0 shadow-lg">
          <Plus className="h-6 w-6" />
        </div>
      </Link>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {stats.map((s) => (
          <Card key={s.label} className="card-hover">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>الأكثر مشاهدة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topViewed.map((p) => (
              <div key={p.id} className="flex justify-between text-sm gap-2">
                <Link href={`/projects/${p.slug}`} className="hover:text-primary truncate">
                  {p.name}
                </Link>
                <Badge variant="secondary">{p.viewCount}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>حالة الـ Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {published.map((p) => (
              <div key={p.id} className="flex justify-between text-sm gap-2">
                <span className="font-mono text-xs truncate">{p.slug}</span>
                <Badge
                  variant={
                    p.demoMode === "DISABLED" ? "secondary" : p.demoUrl ? "success" : "warning"
                  }
                >
                  {p.demoMode === "DISABLED" ? "DISABLED" : p.demoUrl ? "READY" : p.demoMode}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
