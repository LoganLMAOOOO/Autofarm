import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat().format(number);
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function calculateWinPercentage(wins: number, losses: number): number {
  if (wins + losses === 0) return 0;
  return parseFloat(((wins / (wins + losses)) * 100).toFixed(1));
}

export function getElapsedTimeString(startTime: Date): string {
  const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
  
  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  
  return `${minutes}m`;
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-[#3CF582] bg-[#3CF582]/20';
    case 'paused':
      return 'text-amber-500 bg-amber-500/20';
    case 'offline':
      return 'text-[#FF2E63] bg-[#FF2E63]/20';
    default:
      return 'text-white/50 bg-white/5';
  }
}

export function getLogTypeColor(type: string): string {
  switch (type.toLowerCase()) {
    case 'prediction win':
      return 'border-[#3CF582]';
    case 'points claimed':
      return 'border-[#00F0FF]';
    case 'prediction loss':
      return 'border-[#FF2E63]';
    case 'system event':
      return 'border-[#B537F2]';
    case 'warning':
      return 'border-amber-500';
    default:
      return 'border-white/20';
  }
}
