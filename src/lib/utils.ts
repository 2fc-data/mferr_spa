import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCompactCurrency(val: number) {
  const absVal = Math.abs(val);
  let formatted = "";
  let suffix = "";

  if (absVal >= 1000000000) {
    formatted = (val / 1000000000).toFixed(1);
    suffix = "bi";
  } else if (absVal >= 1000000) {
    formatted = (val / 1000000).toFixed(1);
    suffix = "mi";
  } else if (absVal >= 1000) {
    formatted = (val / 1000).toFixed(1);
    suffix = "mil";
  } else {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  }

  // Remove .0 and replace . with ,
  const finalValue = formatted.replace(/\.0$/, "").replace(".", ",");
  return `R$ ${finalValue}${suffix}`;
}

export function calculateAge(birthDate: string) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function maskDocument(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  } else {
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);
  }
}

export function toSentenceCase(str: string) {
  if (!str) return "";
  const endsWithSpace = str.endsWith(' ');
  const formatted = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  return endsWithSpace ? formatted.replace(/\s+$/, ' ') : formatted;
}

export function toTitleCase(str: string) {
  if (!str) return "";
  const particles = ['de', 'da', 'do', 'das', 'dos', 'e'];
  
  // Identify if there's a trailing space to preserve it during typing
  const endsWithSpace = str.endsWith(' ');
  
  const formatted = str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (word.length === 0) return "";
      if (index > 0 && particles.includes(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');

  return endsWithSpace ? formatted.replace(/\s+$/, ' ') : formatted;
}

export function capitalize(str: string) {
  return toTitleCase(str);
}

export function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

export function maskRG(value: string) {
  const clean = value.replace(/[^0-9xX]/g, "").toUpperCase();
  return clean
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})([0-9X])/, "$1-$2")
    .slice(0, 12);
}

export function maskPIS(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{5})(\d)/, "$1.$2")
    .replace(/(\d{2})(\d)/, "$1-$2");
}

export function maskCTPS(value: string) {
  const clean = value.replace(/[^0-9a-zA-Z]/g, "").toUpperCase();
  return clean
    .replace(/^(\d{7})(\d)/, "$1/$2")
    .replace(/^(\d{7})\/(\d{3})(\w)/, "$1/$2-$3")
    .slice(0, 13);
}

export function formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", options).format(new Date(date));
}
