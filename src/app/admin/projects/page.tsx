import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAllProjects } from "@/lib/data/store";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ProjectAdminActions } from "@/components/admin/project-admin-actions";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">إدارة المشاريع</h1>
        <div className="flex gap-2">
          <Button asChild size="lg" className="rounded-xl shadow-lg shadow-primary/20">
            <Link href="/admin/projects/new">
              <Plus className="h-5 w-5" />
              رفع مشروع جديد
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link href="/admin">← لوحة التحكم</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-start p-4 font-medium">الاسم</th>
              <th className="text-start p-4 font-medium">الحالة</th>
              <th className="text-start p-4 font-medium">السعر</th>
              <th className="text-start p-4 font-medium">Demo</th>
              <th className="text-start p-4 font-medium">تحكم</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((r) => (
              <tr key={r.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {r.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.coverImageUrl} alt="" className="h-10 w-14 rounded-lg object-cover" />
                    ) : (
                      <div className="h-10 w-14 rounded-lg bg-muted" />
                    )}
                    <div>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{r.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge
                    variant={
                      r.status === "PUBLISHED" ? "success" : r.status === "DRAFT" ? "warning" : "secondary"
                    }
                  >
                    {r.status}
                  </Badge>
                </td>
                <td className="p-4">{formatPrice(r.priceEgp)}</td>
                <td className="p-4">
                  <Badge variant="outline">{r.demoUrl ? "جاهز" : r.demoMode}</Badge>
                </td>
                <td className="p-4">
                  <ProjectAdminActions id={r.id} slug={r.slug} status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
