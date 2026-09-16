"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Upload, FileArchive, CheckCircle2, Loader2, AlertCircle, ImagePlus } from "lucide-react";

const CATEGORY_OPTIONS = [
  { slug: "healthcare", name: "رعاية صحية" },
  { slug: "ecommerce", name: "تجارة إلكترونية" },
  { slug: "education", name: "تعليم" },
  { slug: "restaurant", name: "مطاعم" },
  { slug: "management", name: "إدارة" },
  { slug: "ai", name: "AI" },
  { slug: "web-apps", name: "تطبيقات ويب" },
];

type LangStat = { language: string; files: number; percent: number };

export default function NewProjectPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [zipName, setZipName] = useState("");
  const [scanOk, setScanOk] = useState(false);
  const [languages, setLanguages] = useState<LangStat[]>([]);
  const [detectedType, setDetectedType] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [pendingId, setPendingId] = useState("");
  const [demoRunnable, setDemoRunnable] = useState(false);
  const [demoMsg, setDemoMsg] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
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
  const [demoMode, setDemoMode] = useState<"DISABLED" | "EXTERNAL_URL" | "AUTO">("DISABLED");
  const [demoUrl, setDemoUrl] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");
  const [isFeatured, setIsFeatured] = useState(false);

  async function onZipSelected(file: File | null) {
    if (!file) return;
    setError("");
    setScanOk(false);
    setZipName(file.name);
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/projects/analyze", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل رفع/فحص الملف");
        if (data.details) setError((data.error || "") + ": " + (data.details as string[]).join("، "));
        setZipName("");
        return;
      }
      setScanOk(true);
      setLanguages(data.languages || []);
      setDetectedType(data.detection?.framework || data.detection?.type || "");
      setPendingId(data.demo?.pendingId || "");
      setDemoRunnable(!!data.demo?.runnable);
      setDemoMsg(data.demo?.message || "");
      const s = data.suggested || {};
      if (s.name) setName(s.name);
      if (s.shortDescription) setShortDescription(s.shortDescription);
      if (s.fullDescription) setFullDescription(s.fullDescription);
      if (s.technologies?.length) setTechnologies(s.technologies.join(", "));
      if (s.features?.length) setFeatures(s.features.join("\n"));
      if (s.framework) setFramework(s.framework);
      if (s.requirements) setRequirements(s.requirements);
    } catch {
      setError("خطأ أثناء رفع الملف");
      setZipName("");
    } finally {
      setAnalyzing(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || undefined,
          shortDescription,
          fullDescription,
          priceEgp: Number(priceEgp),
          oldPriceEgp: oldPriceEgp ? Number(oldPriceEgp) : null,
          categorySlug,
          technologies: technologies.split(",").map((t) => t.trim()).filter(Boolean),
          features: features.split("\n").map((t) => t.trim()).filter(Boolean),
          requirements: requirements || undefined,
          version,
          framework: framework || undefined,
          demoMode,
          demoUrl: demoMode === "EXTERNAL_URL" ? demoUrl : null,
          status,
          isFeatured,
          coverImageUrl: coverImageUrl || undefined,
          pendingId: pendingId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل الحفظ");
        return;
      }
      setSuccess("تم حفظ المشروع بنجاح");
      setTimeout(() => router.push("/admin/projects"), 900);
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full h-11 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">رفع مشروع جديد</h1>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Sparkles className="h-4 w-4 text-primary" />
            ارفع ZIP → فحص أمني → استخراج تلقائي للغات والوصف (قابل للتعديل)
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/projects">رجوع</Link>
        </Button>
      </div>

      {/* ZIP UPLOAD */}
      <Card className="mb-6 border-2 border-dashed border-primary/40 bg-primary/5">
        <CardContent className="p-6">
          <input
            ref={fileRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => onZipSelected(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            disabled={analyzing}
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-3 py-8 rounded-xl hover:bg-primary/10 transition-colors"
          >
            {analyzing ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : scanOk ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            ) : (
              <div className="h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center text-white shadow-lg">
                <Upload className="h-7 w-7" />
              </div>
            )}
            <div className="text-center">
              <div className="font-bold text-lg">
                {analyzing ? "جاري الفحص والتحليل..." : scanOk ? "تم الرفع والفحص بنجاح" : "اضغط لرفع ملف المشروع (ZIP)"}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {zipName ? (
                  <span className="inline-flex items-center gap-1">
                    <FileArchive className="h-4 w-4" /> {zipName}
                  </span>
                ) : (
                  "من جهازك — حد أقصى 50 ميجا"
                )}
              </p>
            </div>
            {!analyzing && (
              <span className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium shadow-md">
                <Upload className="h-4 w-4" />
                اختر ملف ZIP من الجهاز
              </span>
            )}
          </button>

          {scanOk && (
            <div className="mt-4 space-y-3 border-t pt-4">
              {detectedType && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="success">النوع المكتشف</Badge>
                  <span className="font-medium">{detectedType}</span>
                </div>
              )}
              {languages.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">لغات البرمجة ونسبة الملفات</div>
                  <div className="space-y-2">
                    {languages.slice(0, 8).map((l) => (
                      <div key={l.language} className="flex items-center gap-3 text-sm">
                        <span className="w-24 shrink-0 font-medium">{l.language}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, l.percent)}%` }}
                          />
                        </div>
                        <span className="w-12 text-end text-muted-foreground tabular-nums">{l.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                الفحص الأمني ناجح — يمكنك تعديل البيانات بالأسفل قبل الحفظ
              </p>
              {demoMsg && (
                <p className={`text-sm rounded-lg px-3 py-2 ${demoRunnable ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/10 text-amber-800 dark:text-amber-300"}`}>
                  {demoRunnable ? "✓ " : "⚠ "}{demoMsg}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      
      {/* Cover image */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">صورة غلاف المشروع</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={imgRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setUploadingImg(true);
              setError("");
              try {
                const fd = new FormData();
                fd.append("file", f);
                const res = await fetch("/api/upload", { method: "POST", body: fd });
                const data = await res.json();
                if (!res.ok) setError(data.error || "فشل رفع الصورة");
                else setCoverImageUrl(data.url);
              } catch {
                setError("خطأ رفع الصورة");
              } finally {
                setUploadingImg(false);
              }
            }}
          />
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            className="w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 relative overflow-hidden hover:bg-muted/40"
          >
            {coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                {uploadingImg ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <ImagePlus className="h-8 w-8 text-muted-foreground" />}
                <span className="text-sm text-muted-foreground">اضغط لرفع صورة تظهر كخلفية للمشروع</span>
              </>
            )}
          </button>
        </CardContent>
      </Card>

<form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">معلومات المشروع (قابلة للتعديل)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>اسم المشروع *</label>
              <input className={inputClass} required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Slug (اختياري)</label>
              <input className={inputClass} dir="ltr" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto" />
            </div>
            <div>
              <label className={labelClass}>التصنيف *</label>
              <select className={inputClass} value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>وصف قصير *</label>
              <input className={inputClass} required value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>الوصف الكامل *</label>
              <textarea
                className="w-full min-h-[140px] rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">التسعير</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>السعر (ج.م) *</label>
              <input type="number" min={1} className={inputClass} required value={priceEgp} onChange={(e) => setPriceEgp(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>السعر السابق</label>
              <input type="number" min={1} className={inputClass} value={oldPriceEgp} onChange={(e) => setOldPriceEgp(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تقني — من التحليل (عدّل بحرية)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>التقنيات</label>
              <input className={inputClass} dir="ltr" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>الإطار</label>
              <input className={inputClass} value={framework} onChange={(e) => setFramework(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>المميزات (سطر لكل ميزة)</label>
              <textarea className="w-full min-h-[100px] rounded-xl border bg-background px-3 py-2 text-sm" value={features} onChange={(e) => setFeatures(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>المتطلبات</label>
              <input className={inputClass} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>الإصدار</label>
              <input className={inputClass} dir="ltr" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Demo والنشر</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelClass}>وضع Demo</label>
              <select className={inputClass} value={demoMode} onChange={(e) => setDemoMode(e.target.value as typeof demoMode)}>
                <option value="DISABLED">معطّل</option>
                <option value="EXTERNAL_URL">رابط خارجي</option>
                <option value="AUTO">تلقائي</option>
              </select>
            </div>
            {demoMode === "EXTERNAL_URL" && (
              <div>
                <label className={labelClass}>رابط Demo</label>
                <input className={inputClass} dir="ltr" type="url" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
              </div>
            )}
            <div>
              <label className={labelClass}>النشر</label>
              <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value="PUBLISHED">منشور</option>
                <option value="DRAFT">مسودة</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              مميز في الرئيسية
            </label>
          </CardContent>
        </Card>

        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 text-destructive px-4 py-3 text-sm flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <div className="flex gap-3 sticky bottom-4 bg-background/90 backdrop-blur p-3 rounded-xl border shadow-lg">
          <Button type="submit" disabled={loading} className="flex-1 h-12 rounded-xl text-base">
            {loading ? "جاري الحفظ..." : "حفظ المشروع"}
          </Button>
          <Button type="button" variant="outline" className="h-12 rounded-xl" asChild>
            <Link href="/admin/projects">إلغاء</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
