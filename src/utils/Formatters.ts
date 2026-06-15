export function formatBRL(value: number | string): string {
  const num = Number(value);

  if (isNaN(num)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(num);
}

export const formatBRLCompact = (value: number): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `R$ ${millions.toFixed(1).replace('.', ',')} mi`;
  }
  if (value >= 1_000) {
    const thousands = Math.round(value / 1_000);
    return `R$ ${thousands} m`;
  }
  return `R$ ${value}`;
};