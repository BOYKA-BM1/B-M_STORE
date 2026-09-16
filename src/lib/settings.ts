export const STORE_SETTINGS = {
  storeName: "B&M STORE",
  storeNameAr: "متجر المشاريع البرمجية",
  whatsappNumber: process.env.WHATSAPP_NUMBER || "201114342972",
  currency: "EGP",
  defaultLocale: "ar",
  contactEmail: process.env.CONTACT_EMAIL || "support@example.com",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  demoDomain: process.env.NEXT_PUBLIC_DEMO_DOMAIN || "demo.localhost",
  maxUploadMb: 50,
  demoTtlHours: 24,
};

export function getWhatsAppNumber(): string {
  return STORE_SETTINGS.whatsappNumber.replace(/\D/g, "");
}
