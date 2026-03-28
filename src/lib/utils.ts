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

export function generateOrderNumber(existingCount?: number): string {
  if (existingCount !== undefined) {
    return `ORD-${String(existingCount + 1).padStart(5, '0')}`;
  }
  const ts = Date.now();
  return `ORD-${String(ts).slice(-6)}`;
}

export function generateUniqueOrderNumber(existingOrderNumbers: string[]): string {
  const existing = new Set(existingOrderNumbers.filter(Boolean));

  let next = '';
  do {
    const ts = Date.now().toString().slice(-8);
    const suffix = Math.floor(100 + Math.random() * 900);
    next = `ORD-${ts}-${suffix}`;
  } while (existing.has(next));

  return next;
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

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

export function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone);
  const digitsOnly = normalized.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

export function getFrameValidationMessage(frameCount: number, minFrames: number, idealFrames: number): string {
  if (frameCount === 0) return 'No frames';
  if (frameCount < minFrames) {
    return `Too few - need at least ${minFrames} (${minFrames - frameCount} more)`;
  }
  if (frameCount < idealFrames) {
    return `Acceptable - ${idealFrames - frameCount} more for ideal quality`;
  }
  return 'Ready';
}

export function validateFrameFile(file: File, maxSizeMb = 10): string | null {
  const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    return `${file.name}: unsupported format. Use PNG, JPG, or WebP.`;
  }

  const maxBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return `${file.name}: exceeds ${maxSizeMb}MB size limit.`;
  }

  return null;
}
