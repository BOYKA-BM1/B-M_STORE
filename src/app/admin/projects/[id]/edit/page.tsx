"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImagePlus, Loader2 } from "lucide-react";

const CATEGORY_OPTIONS = [
  { slug: "healthcare", name: "رعاية صحية" },
  { slug: "ecommerce", name: "تجارة إلكترونية" },
  { slug: "education", name: "تعليم" },
  { slug: "restaurant", name: "مطاعم" },
  { slug: "management", name: "إدارة" },
  { slug: "ai", name: "AI" },
  { slug: "web-apps", name: "تطبيقات ويب" },
];

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const imgRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [priceEgp, setPriceEgp] = useState("");
  const [oldPriceEgp, setOldPriceEgp] = useState("");
  const [categorySlug, setCategorySlug] = useState("web-apps");
  const [technologies, setTechnologies] = useState("");
  const [features, setFeatures] = useState("");
  const [requirements, setRequirements] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [framework, setFramework] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "غير موجود");
          return;
        }
        const p = data.project;
        setName(p.name || "");
        setShortDescription(p.shortDescription || "");
        setFullDescription(p.fullDescription || "");
        setPriceEgp(String(p.priceEgp ?? ""));
        setOldPriceEgp(p.oldPriceEgp ? String(p.oldPriceEgp) : "");
        setCategorySlug(p.categorySlug || "web-apps");
        setTechnologies((p.technologies || []).join(", "));
        setFeatures((p.features || []).join("\n"));
        setRequirements(p.requirements || "");
        setVersion(p.version || "1.0.0");
        setFramework(p.framework || "");
        setStatus(p.status === "DRAFT" ? "DRAFT" : "PUBLISHED");
        setIsFeatured(!!p.isFeatured);
        setCoverImageUrl(p.coverImageUrl || "");
      } catch {
        setError("فشل التحميل");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function uploadCover(file: File) {
    setUploadingImg(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل رفع الصورة");
        return;
      }
      setCoverImageUrl(data.url);
    } catch {
      setError("خطأ رفع الصورة");
    } finally {
      setUploadingImg(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          shortDescription,
          fullDescription,
          priceEgp: Number(priceEgp),
          oldPriceEgp: oldPriceEgp ? Number(oldPriceEgp) : null,
          categorySlug,
          technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
          features: features.split("\n").map((t) => t.trim()).filter(Boolean),
          requirements: requirements || null,
          version,
          framework: framework || null,
          status,
          isFeatured,
          coverImageUrl: coverImageUrl || null,
          demoMode: "EXTERNAL_URL",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل التحديث");
        return;
      }
      setSuccess("تم التحديث بنجاح");
      setTimeout(() => router.push("/admin/projects"), 800);
    } catch {
      setError("خطأ اتصال");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full h-11 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelClass = "block text-sm font-medium mb-1.5";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">تعديل المشروع</h1>
        <Button variant="outline" asChild>
          <Link href="/admin/projects">رجوع</Link>
        </Button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>صورة الغلاف</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={imgRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => imgRef.current?.click()}
              className="w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 overflow-hidden relative hover:bg-muted/50"
            >
              {coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  {uploadingImg ? <Loader2 className="h-8 w-8 animate-spin" /> : <ImagePlus className="h-8 w-8 text-muted-foreground" />}
                  <span className="text-sm text-muted-foreground">اضغط لرفع صورة الغلاف</span>
                </>
              )}
            </button>
            {coverImageUrl && (
              <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setCoverImageUrl("")}>
                إزالة الصورة
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <label className={labelClass}>الاسم *</label>
              <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>وصف قصير *</label>
              <input className={inputClass} required value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>الوصف الكامل *</label>
              <textarea className="w-full min-h-[120px] rounded-xl border px-3 py-2 text-sm" required value={fullDescription} onChange={(e) => setFullDescription(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>التصنيف</label>
              <select className={inputClass} value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>السعر *</label>
                <input type="number" className={inputClass} required value={priceEgp} onChange={(e) => setPriceEgp(e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>سعر قديم</label>
                <input type="number" className={inputClass} value={oldPriceEgp} onChange={(e) => setOldPriceEgp(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>التقنيات</label>
              <input className={inputClass} dir="ltr" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>المميزات</label>
              <textarea className="w-full min-h-[80px] rounded-xl border px-3 py-2 text-sm" value={features} onChange={(e) => setFeatures(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>الحالة</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value="PUBLISHED">منشور</option>
                <option value="DRAFT">مسودة</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              مميز
            </label>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl">
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </Button>
      </form>
    </div>
  );
}
