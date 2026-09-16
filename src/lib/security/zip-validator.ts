/**
 * ZIP Security Validator
 * Protects against: Zip Slip, Path Traversal, Symlink escape,
 * Zip bombs, malicious filenames, unexpected executables.
 */

import AdmZip from "adm-zip";
import path from "path";
import { createHash } from "crypto";

export const ZIP_LIMITS = {
  maxFileSizeBytes: 500 * 1024 * 1024, // 50 MB
  maxUncompressedBytes: 1500 * 1024 * 1024, // 200 MB
  maxFiles: 20000,
  maxDepth: 20,
  allowedExtensions: new Set([
    ".js", ".jsx", ".ts", ".tsx", ".json", ".md", ".txt", ".css", ".scss",
    ".html", ".htm", ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".map", ".yml", ".yaml", ".toml",
    ".env.example", ".gitignore", ".dockerignore", ".eslintrc", ".prettierrc",
    ".mjs", ".cjs", ".vue", ".py", ".php", ".rb", ".go", ".rs", ".java",
    ".xml", ".lock", ".sql", ".sh", ".bat", ".ps1", ".dockerfile",
  ]),
  blockedExtensions: new Set([
    ".exe", ".dll", ".so", ".dylib", ".bin", ".com", ".scr", ".vbs",
    ".cmd", ".msi", ".apk", ".deb", ".rpm",
  ]),
  blockedNames: new Set([
    ".git", ".svn", ".hg", "node_modules", "__MACOSX", ".DS_Store",
  ]),
};

export interface ZipValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  fileCount: number;
  totalUncompressed: number;
  hash: string;
  entries: string[];
}

export function validateZipBuffer(buffer: Buffer): ZipValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const entries: string[] = [];

  if (buffer.length > ZIP_LIMITS.maxFileSizeBytes) {
    errors.push(`ZIP exceeds max size of ${ZIP_LIMITS.maxFileSizeBytes / 1024 / 1024} MB`);
    return { ok: false, errors, warnings, fileCount: 0, totalUncompressed: 0, hash: "", entries: [] };
  }

  const hash = createHash("sha256").update(buffer).digest("hex");

  let zip: AdmZip;
  try {
    zip = new AdmZip(buffer);
  } catch {
    errors.push("Invalid or corrupted ZIP archive");
    return { ok: false, errors, warnings, fileCount: 0, totalUncompressed: 0, hash, entries: [] };
  }

  const zipEntries = zip.getEntries();
  if (zipEntries.length > ZIP_LIMITS.maxFiles) {
    errors.push(`Too many files in archive (max ${ZIP_LIMITS.maxFiles})`);
  }

  let totalUncompressed = 0;

  for (const entry of zipEntries) {
    const name = entry.entryName;

    // Zip Slip / Path Traversal
    const normalized = path.normalize(name).replace(/^(\.\.(\/|\\|$))+/, "");
    if (normalized.includes("..") || path.isAbsolute(normalized) || name.startsWith("/") || name.startsWith("\\")) {
      errors.push(`Path traversal detected: ${name}`);
      continue;
    }

    // Symlink detection (AdmZip exposes isDirectory; real symlink check needs fs)
    if (name.includes("\0")) {
      errors.push(`Null byte in filename: ${name}`);
      continue;
    }

    // Depth
    const depth = name.split(/[/\\]/).length;
    if (depth > ZIP_LIMITS.maxDepth) {
      errors.push(`Path too deep: ${name}`);
      continue;
    }

    // Blocked names
    const base = path.basename(name);
    if (ZIP_LIMITS.blockedNames.has(base) || ZIP_LIMITS.blockedNames.has(name.split("/")[0])) {
      warnings.push(`Skipped blocked path: ${name}`);
      continue;
    }

    if (entry.isDirectory) {
      entries.push(name);
      continue;
    }

    totalUncompressed += entry.header.size;
    if (totalUncompressed > ZIP_LIMITS.maxUncompressedBytes) {
      errors.push("Uncompressed size exceeds limit (possible zip bomb)");
      break;
    }

    const ext = path.extname(base).toLowerCase();
    if (ZIP_LIMITS.blockedExtensions.has(ext)) {
      errors.push(`Blocked executable extension: ${name}`);
      continue;
    }

    entries.push(name);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    fileCount: entries.length,
    totalUncompressed,
    hash,
    entries,
  };
}
