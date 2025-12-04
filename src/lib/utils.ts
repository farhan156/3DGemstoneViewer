import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateGemstoneId(): string {
  return `gem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCertificateId(): string {
  return `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getGemstoneColor(type: string): string {
  const colors: Record<string, string> = {
    ruby: '#9b1c31',
    sapphire: '#0f4c81',
    emerald: '#196844',
    diamond: '#e8e8e8',
  };
  return colors[type] || '#666666';
}
