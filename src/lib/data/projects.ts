/**
 * Central project data layer.
 * Works offline with seed data. When DATABASE_URL + Prisma are configured,
 * replace getPublishedProjects / getProjectBySlug with prisma queries.
 */

export type DemoMode = "AUTO" | "EXTERNAL_URL" | "DISABLED";
export type ProjectStatus = "DRAFT" | "PRIVATE" | "PUBLISHED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  status: ProjectStatus;
  priceEgp: number;
  oldPriceEgp?: number;
  discountPercent?: number;
  categorySlug: string;
  categoryName: string;
  technologies: string[];
  framework?: string;
  features: string[];
  requirements?: string;
  version: string;
  demoMode: DemoMode;
  demoUrl?: string;
  demoUsername?: string;
  demoPassword?: string;
  coverImageUrl?: string;
  isFeatured: boolean;
  viewCount: number;
  whatsappClicks: number;
  publishedAt?: string;
  updatedAt: string;
}

export const CATEGORIES = [
  { name: "رعاية صحية", nameEn: "Healthcare", slug: "healthcare" },
  { name: "تجارة إلكترونية", nameEn: "E-commerce", slug: "ecommerce" },
  { name: "تعليم", nameEn: "Education", slug: "education" },
  { name: "مطاعم", nameEn: "Restaurant", slug: "restaurant" },
  { name: "إدارة", nameEn: "Management", slug: "management" },
  { name: "AI", nameEn: "AI", slug: "ai" },
  { name: "تطبيقات ويب", nameEn: "Web Apps", slug: "web-apps" },
];

export const PROJECTS: Project[] = [
  {
    id: "proj_clinic_001",
    name: "نظام إدارة العيادات",
    slug: "clinic-management",
    shortDescription: "نظام متكامل لإدارة العيادات والمواعيد والمرضى والفواتير",
    fullDescription:
      "نظام احترافي لإدارة العيادات يشمل تسجيل المرضى، جدولة المواعيد، السجلات الطبية، الفواتير، والتقارير. مبني بـ Next.js وPostgreSQL مع لوحة تحكم كاملة وصلاحيات متعددة.",
    status: "PUBLISHED",
    priceEgp: 4500,
    oldPriceEgp: 6000,
    discountPercent: 25,
    categorySlug: "healthcare",
    categoryName: "رعاية صحية",
    technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind", "Prisma"],
    framework: "Next.js",
    features: [
      "إدارة المرضى والمواعيد",
      "سجلات طبية إلكترونية",
      "فواتير ومدفوعات",
      "تقارير وإحصائيات",
      "صلاحيات متعددة (طبيب / استقبال / أدمن)",
    ],
    requirements: "Node.js 18+, PostgreSQL 14+",
    version: "2.1.0",
    demoMode: "EXTERNAL_URL",
    demoUrl: "https://example.com/demo/clinic",
    isFeatured: true,
    viewCount: 128,
    whatsappClicks: 24,
    publishedAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
  {
    id: "proj_rest_001",
    name: "نقطة بيع للمطاعم",
    slug: "restaurant-pos",
    shortDescription: "نظام POS للمطاعم مع إدارة الطلبات والمخزون والمطبخ",
    fullDescription:
      "نظام نقطة بيع مصمم للمطاعم والكافيهات. يدعم الطلبات، الطاولات، المخزون، شاشة المطبخ، والتقارير اليومية.",
    status: "PUBLISHED",
    priceEgp: 3200,
    categorySlug: "restaurant",
    categoryName: "مطاعم",
    technologies: ["React", "Node.js", "MongoDB", "Socket.io"],
    framework: "React",
    features: ["طلبات الطاولات", "إدارة المخزون", "شاشة مطبخ", "تقارير المبيعات"],
    requirements: "Node.js 16+",
    version: "1.4.0",
    demoMode: "DISABLED",
    isFeatured: true,
    viewCount: 95,
    whatsappClicks: 18,
    publishedAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-20T00:00:00.000Z",
  },
  {
    id: "proj_ecom_001",
    name: "متجر إلكتروني جاهز",
    slug: "ecommerce-starter",
    shortDescription: "متجر إلكتروني كامل مع لوحة تحكم وسلة ودفع",
    fullDescription:
      "متجر إلكتروني جاهز للتشغيل مع كتالوج منتجات، سلة تسوق، تكامل دفع، ولوحة إدارة كاملة.",
    status: "PUBLISHED",
    priceEgp: 5500,
    oldPriceEgp: 7000,
    discountPercent: 21,
    categorySlug: "ecommerce",
    categoryName: "تجارة إلكترونية",
    technologies: ["Next.js", "Stripe", "Prisma", "Tailwind"],
    framework: "Next.js",
    features: ["كتالوج منتجات", "سلة ودفع", "لوحة إدارة", "كوبونات خصم"],
    requirements: "Node.js 18+",
    version: "1.0.0",
    demoMode: "EXTERNAL_URL",
    demoUrl: "https://example.com/demo/shop",
    isFeatured: true,
    viewCount: 210,
    whatsappClicks: 41,
    publishedAt: "2026-01-20T00:00:00.000Z",
    updatedAt: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "proj_lms_001",
    name: "منصة تعليم إلكتروني",
    slug: "lms-platform",
    shortDescription: "نظام إدارة تعلم مع دورات واختبارات وشهادات",
    fullDescription:
      "منصة LMS متكاملة: دورات فيديو، اختبارات، تقدم الطلاب، شهادات، ولوحة معلم/أدمن.",
    status: "PUBLISHED",
    priceEgp: 7000,
    categorySlug: "education",
    categoryName: "تعليم",
    technologies: ["Next.js", "Supabase", "Tailwind", "Mux"],
    framework: "Next.js",
    features: ["دورات فيديو", "اختبارات", "شهادات", "تقارير تقدم"],
    requirements: "Node.js 18+, حساب Supabase",
    version: "1.2.0",
    demoMode: "EXTERNAL_URL",
    demoUrl: "https://example.com/demo/lms",
    isFeatured: false,
    viewCount: 67,
    whatsappClicks: 12,
    publishedAt: "2026-02-15T00:00:00.000Z",
    updatedAt: "2026-03-05T00:00:00.000Z",
  },
  {
    id: "proj_crm_001",
    name: "CRM خفيف للشركات",
    slug: "crm-lite",
    shortDescription: "إدارة عملاء ومبيعات بسيطة وقوية",
    fullDescription:
      "CRM خفيف للشركات الصغيرة: عملاء، صفقات، مهام، وتقارير بدون تعقيد.",
    status: "PUBLISHED",
    priceEgp: 2800,
    categorySlug: "management",
    categoryName: "إدارة",
    technologies: ["Vue", "Laravel", "MySQL"],
    framework: "Laravel",
    features: ["إدارة عملاء", "صفقات", "مهام", "تقارير"],
    requirements: "PHP 8.1+, MySQL 8",
    version: "1.0.0",
    demoMode: "DISABLED",
    isFeatured: false,
    viewCount: 44,
    whatsappClicks: 7,
    publishedAt: "2026-03-01T00:00:00.000Z",
    updatedAt: "2026-03-01T00:00:00.000Z",
  },
];

export function getPublishedProjects(): Project[] {
  return PROJECTS.filter((p) => p.status === "PUBLISHED");
}

export function getFeaturedProjects(): Project[] {
  return getPublishedProjects().filter((p) => p.isFeatured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug && p.status === "PUBLISHED");
}

export function getProjectsByCategory(categorySlug: string): Project[] {
  return getPublishedProjects().filter((p) => p.categorySlug === categorySlug);
}

export function searchProjects(query: string): Project[] {
  const q = query.trim().toLowerCase();
  if (!q) return getPublishedProjects();
  return getPublishedProjects().filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.fullDescription.toLowerCase().includes(q) ||
      p.categoryName.includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q))
  );
}

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}
