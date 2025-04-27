import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NewMessagePayload } from "./types";

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


export function groupMessagesByDay(msgs: NewMessagePayload[]) {
  const groups: { label: string, items: NewMessagePayload[] }[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formatLabel = (date: Date) => {
    const dOnly = new Date(date.setHours(0, 0, 0, 0)).getTime();
    if (dOnly === new Date(today.setHours(0, 0, 0, 0)).getTime()) return 'Hoje';
    if (dOnly === new Date(yesterday.setHours(0, 0, 0, 0)).getTime()) return 'Ontem';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  msgs.forEach(msg => {
    const ts = msg.data.messageTimestamp < 1e11
      ? msg.data.messageTimestamp * 1000
      : msg.data.messageTimestamp;
    const msgDate = new Date(ts);
    const label = formatLabel(new Date(msgDate));

    const grp = groups.find(g => g.label === label);
    if (grp) {
      grp.items.push(msg);
    } else {
      groups.push({ label, items: [msg] });
    }
  });

  return groups;
}

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, '');

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