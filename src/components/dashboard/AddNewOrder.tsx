'use client';

import { useState, useCallback } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useGemstoneStore } from '@/store/gemstoneStore';
import {
  generateGemstoneId,
  generateUniqueOrderNumber,
  getFrameValidationMessage,
  isValidPhoneNumber,
  normalizePhoneNumber,
  validateFrameFile,
} from '@/lib/utils';
import type { Gemstone } from '@/types/gemstone';

interface AddNewOrderProps {
  onComplete: () => void;
}

const MIN_FRAMES = 24;
const IDEAL_FRAMES = 36;

export default function AddNewOrder({ onComplete }: AddNewOrderProps) {
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const addGemstone = useGemstoneStore((state) => state.addGemstone);

  const [orderNumber, setOrderNumber] = useState(() =>
    generateUniqueOrderNumber(gemstones.map((item) => item.orderNumber || ''))
  );
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<'A' | 'B'>('A');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url;
  };

  const onDropFrames = useCallback((accepted: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    accepted.forEach((file) => {
      const error = validateFrameFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setImageFiles((prev) => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} frame(s) added`);
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
    }
  }, []);

  const onDropRejectedFrames = useCallback((fileRejections: FileRejection[]) => {
    const first = fileRejections[0];
    if (!first) return;
    const firstError = first.errors[0];
    if (!firstError) return;

    if (firstError.code === 'file-too-large') {
      toast.error('Frame file is too large. Maximum size is 10MB per file.');
      return;
    }

    if (firstError.code === 'file-invalid-type') {
      toast.error('Invalid file format. Use PNG, JPG, or WebP.');
      return;
    }

    toast.error(firstError.message);
  }, []);

  const {
    getRootProps: getFrameRootProps,
    getInputProps: getFrameInputProps,
    isDragActive: isFrameDragActive,
  } = useDropzone({
    onDrop: onDropFrames,
    onDropRejected: onDropRejectedFrames,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxSize: 10 * 1024 * 1024,
  });

  const onDropLogo = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      setLogoFile(accepted[0]);
      toast.success('Logo uploaded');
    }
  }, []);

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const frameStatus: 'empty' | 'low' | 'ok' | 'ideal' =
    imageFiles.length === 0
      ? 'empty'
      : imageFiles.length < MIN_FRAMES
      ? 'low'
      : imageFiles.length < IDEAL_FRAMES
      ? 'ok'
      : 'ideal';

  const frameStatusColor = {
    empty: 'text-gray-warm',
    low: 'text-ruby',
    ok: 'text-topaz',
    ideal: 'text-emerald',
  }[frameStatus];

  const frameStatusLabel = getFrameValidationMessage(imageFiles.length, MIN_FRAMES, IDEAL_FRAMES);

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(window.location.origin + link);
    toast.success('Link copied to clipboard!');
  };

  const sendWhatsApp = (phone: string, link: string) => {
    const cleaned = normalizePhoneNumber(phone).replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello! Your 360 jewellery view is ready. View it here: ${window.location.origin}${link}`
    );
    window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
  };

  const handleSaveDraft = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error('Enter a valid phone number');
      return;
    }

    setIsSavingDraft(true);
    const loadingToast = toast.loading('Saving draft...');

    try {
      const gemId = generateGemstoneId();
      const now = new Date().toISOString();

      const draftOrder: Gemstone = {
        id: gemId,
        orderNumber,
        customerName: customerName.trim(),
        customerContact: normalizePhoneNumber(phoneNumber),
        tier,
        title: title.trim() || undefined,
        status: 'draft',
        frames: [],
        createdAt: now,
        updatedAt: now,
      };

      await addGemstone(draftOrder);
      toast.dismiss(loadingToast);
      toast.success('Draft saved');
      onComplete();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save draft');
      console.error(error);
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      toast.error('Enter a valid phone number');
      return;
    }

    if (!title.trim()) {
      toast.error('Title is required for publish');
      return;
    }

    if (imageFiles.length < MIN_FRAMES) {
      toast.error(`Please upload at least ${MIN_FRAMES} rotation frames`);
      return;
    }

    if (tier === 'B' && !logoFile) {
      toast.error('Please upload a logo for Tier B');
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading('Uploading frames...');

    try {
      const gemId = generateGemstoneId();
      const now = new Date().toISOString();

      const frameUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i += 1) {
        const url = await uploadToCloudinary(imageFiles[i], `orders/${gemId}/frames`);
        frameUrls.push(url);
        toast.loading(`Uploading frames... ${i + 1}/${imageFiles.length}`, {
          id: loadingToast,
        });
      }

      let logoUrl: string | undefined;
      if (tier === 'B' && logoFile) {
        toast.loading('Uploading logo...', { id: loadingToast });
        logoUrl = await uploadToCloudinary(logoFile, `orders/${gemId}/logo`);
      }

      const shareableLink = `/view/${gemId}`;

      const publishedOrder: Gemstone = {
        id: gemId,
        orderNumber,
        customerName: customerName.trim(),
        customerContact: normalizePhoneNumber(phoneNumber),
        title: title.trim(),
        tier,
        logoUrl,
        frames: frameUrls,
        shareableLink,
        status: 'completed',
        createdAt: now,
        updatedAt: now,
      };

      await addGemstone(publishedOrder);

      toast.dismiss(loadingToast);
      toast.success('Order created successfully!');
      setCreatedLink(shareableLink);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Upload failed. Please try again.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedLink(null);
    setCustomerName('');
    setPhoneNumber('');
    setTitle('');
    setTier('A');
    setImageFiles([]);
    setLogoFile(null);
    onComplete();
  };

  if (createdLink) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-16">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald/10 border border-emerald/30 flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald">
            <circle cx="18" cy="18" r="15" />
            <path d="M11 18L16 23L25 13" />
          </svg>
        </div>
        <div>
          <h2 className="font-serif text-3xl text-charcoal mb-2">Order Submitted</h2>
          <p className="text-gray-warm">
            Order <span className="font-semibold text-charcoal">{orderNumber}</span> is now live.
          </p>
        </div>

        <div className="bg-white border border-gray-light rounded-xl p-5 text-left space-y-3">
          <p className="text-xs font-medium text-gray-warm uppercase tracking-wider">Shareable link</p>
          <div className="flex items-center gap-3 bg-pearl rounded-lg px-4 py-3">
            <span className="flex-1 text-sm text-charcoal font-mono break-all">{window.location.origin + createdLink}</span>
            <button
              onClick={() => copyLink(createdLink)}
              className="flex-shrink-0 h-9 px-4 bg-gold text-white text-sm font-medium rounded-lg hover:bg-gold-dark transition-all"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => sendWhatsApp(phoneNumber, createdLink)}
            className="h-11 px-6 flex items-center gap-2 bg-[#25D366] text-white font-medium text-sm rounded-xl hover:bg-[#1ebe5a] transition-all shadow-md"
          >
            Send via WhatsApp
          </button>
          <button
            onClick={handleReset}
            className="h-11 px-6 bg-white border border-gray-light text-charcoal font-medium text-sm rounded-xl hover:bg-cream transition-all"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-8">
      <header className="pb-6 border-b border-gray-light/50">
        <h1 className="font-serif text-4xl text-charcoal mb-1 tracking-tight">Add New Order</h1>
        <p className="text-gray-warm text-sm">Save as draft first, then upload frames and submit when ready.</p>
      </header>

      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <label className="block text-xs font-medium text-gray-warm uppercase tracking-wider mb-1">Order Number (Editable)</label>
        <div className="flex items-center gap-3 h-11 px-4 bg-pearl border border-gray-light rounded-lg focus-within:border-gold/50 focus-within:ring-1 focus-within:ring-gold/30 transition-all">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full bg-transparent border-none p-0 font-mono font-semibold text-charcoal tracking-widest focus:ring-0"
            placeholder="e.g. ORD-00001"
          />
          <span className="ml-auto text-xs text-gray-warm bg-cream px-2 py-0.5 rounded whitespace-nowrap">Auto-incremented</span>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-xl text-charcoal mb-5">Customer Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Customer Name <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Phone Number <span className="text-ruby">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+94771234567"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Burmese Ruby 3.5ct"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
            <p className="mt-2 text-xs text-gray-warm">Required when submitting. Optional when saving draft.</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-xl text-charcoal mb-5">Select Tier</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['A', 'B'] as const).map((t) => (
            <label
              key={t}
              className={`relative flex flex-col gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
                tier === t ? 'border-gold bg-gold/5' : 'border-gray-light hover:border-gold/40 hover:bg-cream/30'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value={t}
                checked={tier === t}
                onChange={() => setTier(t)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-charcoal text-lg">Tier {t}</span>
                <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full">
                  {t === 'A' ? 'Standard' : 'Premium'}
                </span>
              </div>
              <p className="text-sm text-gray-warm">{t === 'A' ? 'Video with Title' : 'Video + Logo + Embed Link'}</p>
            </label>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-charcoal">Upload Frames</h2>
          {imageFiles.length > 0 && <span className={`text-sm font-medium ${frameStatusColor}`}>{frameStatusLabel}</span>}
        </div>

        <div
          {...getFrameRootProps()}
          className={`p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isFrameDragActive
              ? 'border-gold bg-gold/5'
              : frameStatus === 'low'
              ? 'border-ruby/40 bg-ruby/5'
              : 'border-gray-light hover:border-gold/50 hover:bg-cream/30'
          }`}
        >
          <input {...getFrameInputProps()} />
          <div className="text-center">
            <h3 className="text-base font-medium text-charcoal mb-1">
              {isFrameDragActive ? 'Drop frames here' : 'Drop rotation frames here'}
            </h3>
            <p className="text-sm text-gray-warm mb-3">PNG, JPG, WebP, max 10MB each</p>
            <div className="inline-flex gap-4 text-xs text-gray-cool bg-cream/50 px-4 py-2 rounded-full">
              <span>Min: {MIN_FRAMES} frames</span>
              <span>.</span>
              <span>Ideal: {IDEAL_FRAMES}+ frames</span>
            </div>
          </div>
        </div>

        {imageFiles.length > 0 && (
          <div className="mt-4 p-4 bg-cream/30 rounded-lg border border-gray-light/50 flex items-center justify-between">
            <div className="flex gap-6 text-sm">
              <span>
                <span className="text-gray-warm">Frames:</span>{' '}
                <span className="font-semibold text-charcoal">{imageFiles.length}</span>
              </span>
              <span className={`font-medium ${frameStatusColor}`}>{frameStatusLabel}</span>
            </div>
            <button onClick={() => setImageFiles([])} className="text-xs text-ruby hover:text-ruby/80 transition-colors">
              Clear all
            </button>
          </div>
        )}
      </section>

      {tier === 'B' && (
        <section className="bg-white rounded-xl border border-gray-light/50 p-6">
          <h2 className="font-serif text-xl text-charcoal mb-5">Brand Logo</h2>
          <div
            {...getLogoRootProps()}
            className={`p-8 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
              isLogoDragActive
                ? 'border-gold bg-gold/5'
                : logoFile
                ? 'border-emerald/40 bg-emerald/5'
                : 'border-gray-light hover:border-gold/50 hover:bg-cream/30'
            }`}
          >
            <input {...getLogoInputProps()} />
            {logoFile ? (
              <div className="flex items-center gap-4">
                <img src={URL.createObjectURL(logoFile)} alt="Logo preview" className="w-16 h-16 object-contain rounded-lg border border-gray-light bg-white p-1" />
                <div>
                  <p className="text-sm font-medium text-charcoal">{logoFile.name}</p>
                  <p className="text-xs text-gray-warm mt-0.5">Click to replace</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm font-medium text-charcoal mb-1">Drop logo here</p>
                <p className="text-xs text-gray-warm">PNG, JPG, SVG, WebP</p>
              </div>
            )}
          </div>
        </section>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-8">
        <button
          onClick={handleSaveDraft}
          disabled={isSavingDraft || isSubmitting}
          className="h-12 px-8 bg-white border border-gray-light text-charcoal font-semibold text-sm rounded-xl hover:bg-cream disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isSavingDraft ? 'Saving draft...' : 'Save as Draft'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || isSavingDraft}
          className="h-12 px-8 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isSubmitting ? 'Uploading...' : 'Submit'}
        </button>
        <p className="text-xs text-gray-warm sm:ml-2">
          Submitting publishes the order, enables copy link, and allows WhatsApp sharing.
        </p>
      </div>
    </div>
  );
}
