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
