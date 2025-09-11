import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(timestamp: string) {
  const messageDate = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  if (messageDateOnly.getTime() === today.getTime()) {
    return messageDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else if (messageDateOnly.getTime() === yesterday.getTime()) {
    return "Ontem";
  } else {
    return messageDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};

export function formatPhone(phone?: string) {
  const cleaned = (phone ?? '').replace(/\D/g, '');

  const country = cleaned.slice(0, 2);
  const area = cleaned.slice(2, 4);
  const rest = cleaned.slice(4);

  if (rest.length === 9) {
    return `+${country} (${area}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }

  if (rest.length === 8) {
    return `+${country} (${area}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return `+${country} (${area}) ${rest}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


export function getContrastColor(hexColor: string) {
  if (hexColor.startsWith("#")) hexColor = hexColor.slice(1);
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "black" : "white";
};

export const isLink = (text: string) => {
  const regex = /(https?:\/\/[^\s]+)/g;
  return regex.test(text);
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const formatPrice = (price: number, currency: string = 'BRL') => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(price);
};

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '');

  // Converte para número e divide por 100 para considerar centavos
  const number = parseFloat(numericValue) / 100;

  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);
};

export const parseCurrencyInput = (value: string): number => {
  // Remove tudo que não é número
  const numericValue = value.replace(/\D/g, '');

  // Converte para número e divide por 100 para considerar centavos
  return parseFloat(numericValue) / 100;
};