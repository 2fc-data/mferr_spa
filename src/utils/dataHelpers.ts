export const extractYear = (dateStr?: string): string | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length < 3) return null;
  const year = parts[2];
  return /^\d{4}$/.test(year) ? year : null;
};

export const extractMonthIndex = (dateStr?: string): number | null => {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(p => p.trim());
  if (parts.length !== 3) return null;

  if (parts[0].length === 4) { // yyyy-mm-dd
    const m = Number(parts[1]);
    return m >= 1 && m <= 12 ? m - 1 : null;
  }

  if (parts[2].length === 4) { // dd-mm-yyyy
    const m = Number(parts[1]);
    return m >= 1 && m <= 12 ? m - 1 : null;
  }

  return null;
};
