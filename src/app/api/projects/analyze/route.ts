import { NextResponse } from "next/server";
import { validateZipBuffer } from "@/lib/security/zip-validator";
import { detectProject } from "@/lib/demo/project-detector";
import { extractZipToDemo } from "@/lib/demo/extract";
import AdmZip from "adm-zip";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const EXT_LANG: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript",
  ".js": "JavaScript",
  ".jsx": "JavaScript",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",
  ".py": "Python",
  ".php": "PHP",
  ".rb": "Ruby",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".css": "CSS",
  ".scss": "SCSS",
  ".html": "HTML",
  ".sql": "SQL",
  ".dart": "Dart",
};

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function basename(name: string) {
  const parts = name.replace(/\\/g, "/").split("/");
  return parts[parts.length - 1] || name;
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "ارفع ملف ZIP" }, { status: 400 });
    }

    const name = (file as File).name || "project.zip";
    if (!name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "الملف يجب أن يكون ZIP" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const validation = validateZipBuffer(buf);
    if (!validation.ok) {
      return NextResponse.json(
        { error: "فشل الفحص الأمني", details: validation.errors },
        { status: 400 }
      );
    }

    let zip: AdmZip;
    try {
      zip = new AdmZip(buf);
    } catch {
      return NextResponse.json({ error: "ZIP تالف" }, { status: 400 });
    }

    const entries = zip.getEntries().filter((e) => !e.isDirectory);
    const fileNames = entries.map((e) => e.entryName.replace(/\\/g, "/"));

    const langCount: Record<string, number> = {};
    let codeFiles = 0;
    for (const fn of fileNames) {
      const ext = extOf(basename(fn));
      const lang = EXT_LANG[ext];
      if (lang) {
        langCount[lang] = (langCount[lang] || 0) + 1;
        codeFiles++;
      }
    }
    const languages = Object.entries(langCount)
      .map(([language, count]) => ({
        language,
        files: count,
        percent: codeFiles ? Math.round((count / codeFiles) * 100) : 0,
      }))
      .sort((a, b) => b.files - a.files);

    let packageJson: Record<string, unknown> | undefined;
    let projectName = "";
    let projectDescription = "";
    const pkgEntry = entries.find((e) => {
      const n = e.entryName.replace(/\\/g, "/");
      return n === "package.json" || n.endsWith("/package.json");
    });
    if (pkgEntry) {
      try {
        packageJson = JSON.parse(pkgEntry.getData().toString("utf8"));
        projectName = String(packageJson?.name || "").replace(/^@[^/]+\//, "");
        projectDescription = String(packageJson?.description || "");
      } catch {
        /* ignore */
      }
    }

    const readmeEntry = entries.find((e) => {
      const n = basename(e.entryName).toLowerCase();
      return n === "readme.md" || n === "readme.txt" || n === "readme";
    });
    let readmePreview = "";
    if (readmeEntry) {
      try {
        readmePreview = readmeEntry.getData().toString("utf8").slice(0, 800);
      } catch {
        /* ignore */
      }
    }

    const detection = detectProject(fileNames, packageJson);

    const techs = new Set<string>();
    if (detection.framework) techs.add(detection.framework);
    const deps = {
      ...((packageJson?.dependencies as object) || {}),
      ...((packageJson?.devDependencies as object) || {}),
    };
    const known = [
      "next", "react", "vue", "nuxt", "angular", "svelte", "express", "nestjs",
      "prisma", "mongoose", "tailwindcss", "typescript", "zod", "stripe",
      "supabase", "firebase", "socket.io", "graphql", "redis",
    ];
    for (const k of known) {
      if (k in deps) {
        const label =
          k === "tailwindcss" ? "Tailwind" :
          k === "typescript" ? "TypeScript" :
          k === "next" ? "Next.js" :
          k === "socket.io" ? "Socket.io" :
          k.charAt(0).toUpperCase() + k.slice(1);
        techs.add(label);
      }
    }
    for (const l of languages.slice(0, 4)) techs.add(l.language);

    const pendingId = `pending_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    let extracted = { ok: false, errors: [] as string[], entryFile: null as string | null, fileCount: 0, folderId: pendingId };
    try {
      extracted = await extractZipToDemo(buf, pendingId);
    } catch (e) {
      console.error("[analyze] extract failed", e);
      extracted = { ok: false, errors: ["extract failed"], entryFile: null, fileCount: 0, folderId: pendingId };
    }
    const hasRunnableDemo = !!extracted.entryFile;
    const shortDescription =
      projectDescription ||
      (detection.framework
        ? `مشروع ${detection.framework} جاهز للتشغيل والتخصيص`
        : "مشروع برمجي جاهز للتشغيل والتخصيص");

    const fullDescription =
      (readmePreview ? readmePreview.replace(/^#+\s*/gm, "").trim().slice(0, 600) : "") ||
      `مشروع تم رفعه وتحليله تلقائيًا.\nالنوع: ${detection.framework || detection.type}\nاللغات: ${
        languages.slice(0, 5).map((l) => `${l.language} (${l.percent}%)`).join("، ") || "—"
      }`;

    const features = [
      detection.framework ? `مبني بـ ${detection.framework}` : null,
      languages[0] ? `اللغة الأساسية: ${languages[0].language}` : null,
      `عدد الملفات: ${validation.fileCount}`,
      hasRunnableDemo ? "Demo مباشر جاهز للتجربة" : "ارفع نسخة build/static لتشغيل Demo كامل",
      detection.hasDockerfile ? "يحتوي على Dockerfile" : null,
    ].filter(Boolean) as string[];

    return NextResponse.json({
      ok: true,
      security: {
        passed: true,
        fileCount: validation.fileCount,
        hash: validation.hash,
        warnings: validation.warnings,
      },
      detection: {
        type: detection.type,
        framework: detection.framework,
        runtime: detection.runtime,
        confidence: detection.confidence,
        packageManager: detection.packageManager,
      },
      languages,
      demo: {
        pendingId,
        runnable: hasRunnableDemo,
        entryFile: extracted.entryFile,
        message: hasRunnableDemo
          ? "تم تجهيز Demo مباشر — الزائر سيفتح المشروع ويعمل به"
          : "لم يُعثر على index.html — ضع مخرجات البناء (dist/out) داخل الـ ZIP ليعمل الـ Demo",
      },
      suggested: {
        name: projectName || name.replace(/\.zip$/i, ""),
        shortDescription,
        fullDescription,
        technologies: Array.from(techs),
        features,
        framework: detection.framework || "",
        requirements:
          detection.runtime === "Node.js"
            ? "Node.js 18+"
            : detection.runtime === "Python"
              ? "Python 3.10+"
              : detection.runtime === "PHP"
                ? "PHP 8.1+"
                : "",
      },
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[analyze]", e);
    return NextResponse.json({ error: "فشل تحليل الملف", details: [msg] }, { status: 500 });
  }
}
