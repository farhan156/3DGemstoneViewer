import { type ClassValue, clsx } from 'clsx';
import type { Gemstone } from '@/types/gemstone';

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

export function generatePublicViewerId(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `g-${Date.now().toString(36)}${random}`;
}

export function getPublicViewerPath(gemstone: Pick<Gemstone, 'publicId' | 'id' | 'shareableLink'>): string {
  if (gemstone.shareableLink?.startsWith('/view/') && gemstone.publicId) {
    return gemstone.shareableLink;
  }

  if (gemstone.publicId) {
    return `/view/${gemstone.publicId}`;
  }

  if (gemstone.shareableLink?.startsWith('/view/')) {
    return gemstone.shareableLink;
  }

  return `/view/${gemstone.id}`;
}

type CloudinaryPreset = 'thumbnail' | 'viewer-low' | 'viewer-high' | 'default';

interface CloudinaryOptimizeOptions {
  preset?: CloudinaryPreset;
  width?: number;
}

export function optimizeCloudinaryUrl(url: string, options: CloudinaryOptimizeOptions = {}): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  // Avoid double-transforming URLs that are already optimized.
  if (/\/upload\/(?:[^/]*q_auto|[^/]*f_auto|[^/]*w_\d+)/.test(url)) {
    return url;
  }

  const preset = options.preset || 'default';
  const transformsByPreset: Record<CloudinaryPreset, string[]> = {
    thumbnail: ['f_auto', 'q_auto:eco', 'dpr_auto', 'c_limit', 'w_600'],
    'viewer-low': ['f_auto', 'q_auto:eco', 'dpr_auto', 'c_limit', 'w_960'],
    'viewer-high': ['f_auto', 'q_auto:good', 'dpr_auto', 'c_limit', 'w_1800'],
    default: ['f_auto', 'q_auto:good', 'dpr_auto', 'c_limit', 'w_1400'],
  };

  const transforms = [...transformsByPreset[preset]];
  if (options.width && options.width > 0) {
    const widthTransform = `w_${Math.round(options.width)}`;
    const widthIdx = transforms.findIndex((value) => value.startsWith('w_'));
    if (widthIdx >= 0) {
      transforms[widthIdx] = widthTransform;
    } else {
      transforms.push(widthTransform);
    }
  }

  return url.replace(
    '/upload/',
    `/upload/${transforms.join(',')}/`
  );
}

export function generateOrderNumber(existingCount?: number): string {
  if (existingCount !== undefined) {
    return `ORD-${String(existingCount + 1).padStart(5, '0')}`;
  }
  const ts = Date.now();
  return `ORD-${String(ts).slice(-6)}`;
}

export function generateUniqueOrderNumber(existingOrderNumbers: string[]): string {
  let max = 0;
  
  for (const numStr of existingOrderNumbers) {
    if (!numStr) continue;
    // Extract the numeric part from something like "ORD-00001" or just "1"
    const match = numStr.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      if (!isNaN(num) && num > max) {
        max = num;
      }
    }
  }

  const nextCount = max + 1;
  return `ORD-${String(nextCount).padStart(5, '0')}`;
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
