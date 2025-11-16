import type { UploadState } from "./types";

export const createUploadState = (): UploadState => ({
  file: null,
  progress: 0,
  columns: [],
  rows: [],
  error: null,
  uploaded: false,
  total: 0,
});

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const formatRunChilean = (run: string): string => {
  if (!run) return "";

  const cleaned = String(run)
    .trim()
    .toUpperCase()
    .replace(/[^0-9K-]/g, "");
  if (!cleaned) return "";

  if (cleaned.includes("-")) {
    return cleaned;
  }

  const dv = cleaned.slice(-1);
  const body = cleaned.slice(0, -1);

  if (!/^\d+$/.test(body)) {
    return cleaned;
  }

  return `${body}-${dv}`;
};

export const normalizeColumnName = (col: string): string => {
  return col
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
};

export const detectMonthFromData = (
  rows: Array<Record<string, unknown>>
): string | undefined => {
  if (rows.length === 0) return undefined;

  const firstRow = rows[0];
  for (const [key, value] of Object.entries(firstRow)) {
    const keyLower = key.toLowerCase();
    if (
      (keyLower.includes("mes") ||
        keyLower.includes("periodo") ||
        keyLower.includes("month")) &&
      value
    ) {
      const monthNum = Number(value);
      if (monthNum >= 1 && monthNum <= 12) {
        return `${monthNum}`.padStart(2, "0");
      }
    }
  }

  return undefined;
};

export const detectDateFromData = (
  rows: Array<Record<string, unknown>>
): string | undefined => {
  if (rows.length === 0) return undefined;

  const firstRow = rows[0];
  for (const [key, value] of Object.entries(firstRow)) {
    const keyLower = key.toLowerCase();
    const hasDateKeyword =
      (keyLower.includes("fecha") || keyLower.includes("date")) && value;

    if (hasDateKeyword) {
      const valStr = String(value).trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(valStr)) {
        return valStr;
      }
    }
  }

  return undefined;
};
