import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { getWhatsAppNumber } from "@/lib/settings";
import { generateWhatsAppUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "تواصل معنا" };

export default function ContactPage() {
  const phone = getWhatsAppNumber();
  const wa = generateWhatsAppUrl(phone, "مرحبًا، أريد الاستفسار عن المشاريع المتاحة.");

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">تواصل معنا</h1>
      <p className="text-muted-foreground mb-8">
        للاستفسارات العامة أو الدعم أو طلب مشروع مخصص، راسلنا عبر واتساب.
      </p>
      <Button asChild size="lg">
        <a href={wa} target="_blank" rel="noopener noreferrer">
          فتح واتساب ({phone})
        </a>
      </Button>
    </div>
  );
}
