export interface VisibilitySettings {
  showName: boolean;
  showType: boolean;
  showWeight: boolean;
  showCut: boolean;
  showClarity: boolean;
  showColorGrade: boolean;
  showOrigin: boolean;
  showCertificate: boolean;
  showCustomerName: boolean;
  showCustomerContact: boolean;
  showCustomerEmail: boolean;
}

export interface Gemstone {
  id: string;
  name?: string;
  type?: 'ruby' | 'sapphire' | 'emerald' | 'diamond' | 'other';
  weight?: number;
  cut?: string;
  clarity?: string;
  colorGrade?: string;
  origin?: string;
  customerName: string;
  customerContact: string;
  customerEmail?: string;
  status: 'uploaded' | 'processing' | 'completed';
  frames: string[];
  thumbnail?: string;
  certificateId?: string;
  shareableLink?: string;
  visibility?: VisibilitySettings;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  gemstoneId: string;
  issuer: string;
  certificateNumber: string;
  fileUrl: string;
  fileType: 'pdf' | 'jpg' | 'png';
  fileSize: number;
  createdAt: string;
}

export interface ViewerState {
  currentFrame: number;
  totalFrames: number;
  isRotating: boolean;
  rotation: number;
  zoom: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}
