import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(timestamp: string) {
  const messageDate = new Date(timestamp);
  const today = new Date();

  const isSameDay =
    messageDate.getDate() === today.getDate() &&
    messageDate.getMonth() === today.getMonth() &&
    messageDate.getFullYear() === today.getFullYear();

  if (isSameDay) {
    return messageDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } else {
    return messageDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
};


export function formatPhone(phone: string) {
  const country = phone.slice(0, 2);
  const area = phone.slice(2, 4);
  const part1 = phone.slice(4, 8);
  const part2 = phone.slice(8);
  return `+${country} (${area}) ${part1} - ${part2}`;
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