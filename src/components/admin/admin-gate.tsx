"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function AdminGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل الدخول");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-8 shadow-lg space-y-6">
      <div className="flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-2xl hero-gradient flex items-center justify-center text-white shadow-lg">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold">دخول لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground">أدخل كلمة السر للمتابعة</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="كلمة السر"
          className="search-box text-center tracking-widest"
          autoFocus
          dir="ltr"
        />
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <Button type="submit" className="w-full h-12 rounded-xl" disabled={loading}>
          {loading ? "جاري التحقق..." : "دخول"}
        </Button>
      </form>
    </div>
  );
}
