/**
 * ProjectDetector – Extensible framework detection
 */

export type DetectedType =
  | "nextjs"
  | "react-vite"
  | "react-cra"
  | "node"
  | "static"
  | "php"
  | "laravel"
  | "python-django"
  | "python-flask"
  | "unknown";

export interface DetectionResult {
  type: DetectedType;
  confidence: number;
  framework?: string;
  runtime?: string;
  packageManager?: "npm" | "yarn" | "pnpm" | "bun";
  hasDockerfile: boolean;
  entryHints: string[];
}

export interface Detector {
  name: string;
  detect(files: string[], packageJson?: Record<string, unknown>): DetectionResult | null;
}

const detectors: Detector[] = [
  {
    name: "nextjs",
    detect(files, pkg) {
      const hasNext =
        files.some((f) => f.includes("next.config")) ||
        (pkg?.dependencies && "next" in (pkg.dependencies as object)) ||
        (pkg?.devDependencies && "next" in (pkg.devDependencies as object));
      if (!hasNext) return null;
      return {
        type: "nextjs",
        confidence: 0.95,
        framework: "Next.js",
        runtime: "Node.js",
        packageManager: detectPm(files),
        hasDockerfile: files.some((f) => f.toLowerCase().includes("dockerfile")),
        entryHints: ["package.json", "next.config.js", "app/", "pages/"],
      };
    },
  },
  {
    name: "vite-react",
    detect(files, pkg) {
      const hasVite =
        files.some((f) => f.includes("vite.config")) ||
        (pkg?.devDependencies && "vite" in (pkg.devDependencies as object));
      const hasReact = pkg?.dependencies && "react" in (pkg.dependencies as object);
      if (hasVite && hasReact) {
        return {
          type: "react-vite",
          confidence: 0.9,
          framework: "React + Vite",
          runtime: "Node.js",
          packageManager: detectPm(files),
          hasDockerfile: files.some((f) => f.toLowerCase().includes("dockerfile")),
          entryHints: ["vite.config.ts", "index.html", "src/main.tsx"],
        };
      }
      return null;
    },
  },
  {
    name: "static",
    detect(files) {
      const hasIndex = files.some((f) => f === "index.html" || f.endsWith("/index.html"));
      const noPackage = !files.some((f) => f === "package.json");
      if (hasIndex && noPackage) {
        return {
          type: "static",
          confidence: 0.85,
          framework: "Static HTML/CSS/JS",
          runtime: "Static",
          hasDockerfile: false,
          entryHints: ["index.html"],
        };
      }
      return null;
    },
  },
  {
    name: "laravel",
    detect(files) {
      if (files.some((f) => f === "artisan") && files.some((f) => f.includes("composer.json"))) {
        return {
          type: "laravel",
          confidence: 0.95,
          framework: "Laravel",
          runtime: "PHP",
          hasDockerfile: files.some((f) => f.toLowerCase().includes("dockerfile")),
          entryHints: ["artisan", "composer.json", "public/index.php"],
        };
      }
      return null;
    },
  },
  {
    name: "django",
    detect(files) {
      if (
        files.some((f) => f.includes("manage.py")) &&
        files.some((f) => f.includes("requirements.txt") || f.includes("pyproject.toml"))
      ) {
        return {
          type: "python-django",
          confidence: 0.9,
          framework: "Django",
          runtime: "Python",
          hasDockerfile: files.some((f) => f.toLowerCase().includes("dockerfile")),
          entryHints: ["manage.py", "requirements.txt"],
        };
      }
      return null;
    },
  },
];

function detectPm(files: string[]): "npm" | "yarn" | "pnpm" | "bun" {
  if (files.some((f) => f.includes("pnpm-lock"))) return "pnpm";
  if (files.some((f) => f.includes("yarn.lock"))) return "yarn";
  if (files.some((f) => f.includes("bun.lock"))) return "bun";
  return "npm";
}

export function detectProject(
  files: string[],
  packageJson?: Record<string, unknown>
): DetectionResult {
  for (const d of detectors) {
    const result = d.detect(files, packageJson);
    if (result) return result;
  }
  return {
    type: "unknown",
    confidence: 0,
    hasDockerfile: files.some((f) => f.toLowerCase().includes("dockerfile")),
    entryHints: [],
  };
}

export function registerDetector(detector: Detector) {
  detectors.unshift(detector);
}
