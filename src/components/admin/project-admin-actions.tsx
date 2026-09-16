"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useState } from "react";

export function ProjectAdminActions({
  id,
  slug,
  status,
}: {
  id: string;
  slug: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("فشل الحذف");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Button size="sm" variant="outline" className="rounded-lg h-8" asChild>
        <Link href={`/admin/projects/${id}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </Link>
      </Button>
      {status === "PUBLISHED" && (
        <Button size="sm" variant="ghost" className="rounded-lg h-8" asChild>
          <Link href={`/projects/${slug}`} target="_blank">
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        className="rounded-lg h-8 text-destructive hover:text-destructive"
        disabled={loading}
        onClick={onDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
        حذف
      </Button>
    </div>
  );
}
