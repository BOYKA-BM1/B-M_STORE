import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-8">الصفحة غير موجودة</p>
      <Button asChild>
        <Link href="/">العودة للرئيسية</Link>
      </Button>
    </div>
  );
}
