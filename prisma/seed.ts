/**
 * Development seed – run after `prisma db push`
 * Requires DATABASE_URL
 */
import { PrismaClient, Role, ProjectStatus, DemoMode } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Settings
  await prisma.setting.upsert({
    where: { key: "store_name" },
    update: {},
    create: { key: "store_name", value: "Software Marketplace" },
  });
  await prisma.setting.upsert({
    where: { key: "whatsapp_number" },
    update: {},
    create: { key: "whatsapp_number", value: "201114342972" },
  });
  await prisma.setting.upsert({
    where: { key: "currency" },
    update: {},
    create: { key: "currency", value: "EGP" },
  });
  await prisma.setting.upsert({
    where: { key: "demo_ttl_hours" },
    update: {},
    create: { key: "demo_ttl_hours", value: "24" },
  });

  // Admin user (password must be hashed in real auth flow)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      role: Role.ADMIN,
      profile: { create: { fullName: "Admin User", locale: "ar" } },
    },
  });

  const categories = [
    { name: "Healthcare", nameAr: "رعاية صحية", slug: "healthcare" },
    { name: "E-commerce", nameAr: "تجارة إلكترونية", slug: "ecommerce" },
    { name: "Education", nameAr: "تعليم", slug: "education" },
    { name: "Restaurant", nameAr: "مطاعم", slug: "restaurant" },
    { name: "Management", nameAr: "إدارة", slug: "management" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const health = await prisma.category.findUnique({ where: { slug: "healthcare" } });
  const ecom = await prisma.category.findUnique({ where: { slug: "ecommerce" } });
  const rest = await prisma.category.findUnique({ where: { slug: "restaurant" } });

  if (health) {
    await prisma.project.upsert({
      where: { slug: "clinic-management" },
      update: {},
      create: {
        name: "نظام إدارة العيادات",
        slug: "clinic-management",
        shortDescription: "نظام متكامل لإدارة العيادات والمواعيد",
        fullDescription: "وصف تفصيلي للنظام...",
        status: ProjectStatus.PUBLISHED,
        priceEgp: 4500,
        oldPriceEgp: 6000,
        categoryId: health.id,
        technologies: ["Next.js", "PostgreSQL", "Tailwind"],
        framework: "Next.js",
        features: ["مرضى", "مواعيد", "فواتير"],
        demoMode: DemoMode.EXTERNAL_URL,
        demoExternalUrl: "https://example.com/demo/clinic",
        isFeatured: true,
        publishedAt: new Date(),
        securityScanPassed: true,
        detectedType: "nextjs",
      },
    });
  }

  if (rest) {
    await prisma.project.upsert({
      where: { slug: "restaurant-pos" },
      update: {},
      create: {
        name: "نقطة بيع للمطاعم",
        slug: "restaurant-pos",
        shortDescription: "نظام POS للمطاعم",
        status: ProjectStatus.PUBLISHED,
        priceEgp: 3200,
        categoryId: rest.id,
        technologies: ["React", "Node.js"],
        demoMode: DemoMode.DISABLED,
        publishedAt: new Date(),
        securityScanPassed: true,
      },
    });
  }

  if (ecom) {
    await prisma.project.upsert({
      where: { slug: "ecommerce-starter" },
      update: {},
      create: {
        name: "متجر إلكتروني جاهز",
        slug: "ecommerce-starter",
        shortDescription: "متجر إلكتروني كامل",
        status: ProjectStatus.PUBLISHED,
        priceEgp: 5500,
        oldPriceEgp: 7000,
        categoryId: ecom.id,
        technologies: ["Next.js", "Prisma", "Stripe"],
        demoMode: DemoMode.EXTERNAL_URL,
        demoExternalUrl: "https://example.com/demo/shop",
        isFeatured: true,
        publishedAt: new Date(),
        securityScanPassed: true,
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
