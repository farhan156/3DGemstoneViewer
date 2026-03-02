'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useGemstoneStore } from '@/store/gemstoneStore';
import { generateGemstoneId, generateOrderNumber } from '@/lib/utils';

interface AddNewOrderProps {
  onComplete: () => void;
}

const MIN_FRAMES = 24;
const IDEAL_FRAMES = 36;

export default function AddNewOrder({ onComplete }: AddNewOrderProps) {
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const addGemstone = useGemstoneStore((state) => state.addGemstone);

  const [orderNumber] = useState(() => generateOrderNumber(gemstones.length));
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [title, setTitle] = useState('');
  const [tier, setTier] = useState<'A' | 'B'>('A');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);

  // Upload to Cloudinary
  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'upload_preset',
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url;
  };

  /* ── Frames dropzone ── */
  const onDropFrames = useCallback((accepted: File[]) => {
    setImageFiles((prev) => [...prev, ...accepted]);
    toast.success(`${accepted.length} frame(s) added`);
  }, []);

  const {
    getRootProps: getFrameRootProps,
    getInputProps: getFrameInputProps,
    isDragActive: isFrameDragActive,
  } = useDropzone({
    onDrop: onDropFrames,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
  });

  /* ── Logo dropzone (Tier B) ── */
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
  });

  /* ── Frame validation state ── */
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

  const frameStatusLabel = {
    empty: 'No frames',
    low: `Too few — need at least ${MIN_FRAMES} (${MIN_FRAMES - imageFiles.length} more)`,
    ok: `Acceptable — ${IDEAL_FRAMES - imageFiles.length} more for ideal quality`,
    ideal: '✓ Ready',
  }[frameStatus];

  /* ── Copy link helper ── */
  const copyLink = (link: string) => {
    navigator.clipboard.writeText(window.location.origin + link);
    toast.success('Link copied to clipboard!');
  };

  /* ── WhatsApp send ── */
  const sendWhatsApp = (phone: string, link: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello! Your 360° jewellery view is ready. View it here: ${window.location.origin}${link}`
    );
    window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!title.trim()) {
      toast.error('Title is required');
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
    const loadingToast = toast.loading('Uploading frames…');

    try {
      const gemId = generateGemstoneId();

      // Upload frames
      const frameUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadToCloudinary(
          imageFiles[i],
          `orders/${gemId}/frames`
        );
        frameUrls.push(url);
        toast.loading(`Uploading frames… ${i + 1}/${imageFiles.length}`, {
          id: loadingToast,
        });
      }

      // Upload logo (Tier B)
      let logoUrl: string | undefined;
      if (tier === 'B' && logoFile) {
        toast.loading('Uploading logo…', { id: loadingToast });
        logoUrl = await uploadToCloudinary(logoFile, `orders/${gemId}/logo`);
      }

      toast.loading('Saving order…', { id: loadingToast });

      const shareableLink = `/view/${gemId}`;

      const newOrder: any = {
        id: gemId,
        orderNumber,
        customerName,
        customerContact: phoneNumber,
        tier,
        frames: frameUrls,
        shareableLink,
        status: 'completed' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add optional fields if they have a value (Firestore rejects undefined)
      if (title.trim()) newOrder.title = title.trim();
      if (logoUrl) newOrder.logoUrl = logoUrl;

      await addGemstone(newOrder);

      toast.dismiss(loadingToast);
      toast.success('Order created successfully!');
      setCreatedLink(shareableLink);
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Reset form ── */
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

  /* ── Success screen ── */
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
          <h2 className="font-serif text-3xl text-charcoal mb-2">Order Created!</h2>
          <p className="text-gray-warm">Order <span className="font-semibold text-charcoal">{orderNumber}</span> is live.</p>
        </div>

        {/* Link box */}
        <div className="bg-white border border-gray-light rounded-xl p-5 text-left space-y-3">
          <p className="text-xs font-medium text-gray-warm uppercase tracking-wider">Shareable link</p>
          <div className="flex items-center gap-3 bg-pearl rounded-lg px-4 py-3">
            <span className="flex-1 text-sm text-charcoal font-mono break-all">
              {window.location.origin + createdLink}
            </span>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
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

  /* ── Form ── */
  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-gray-light/50">
        <h1 className="font-serif text-4xl text-charcoal mb-1 tracking-tight">Add New Order</h1>
        <p className="text-gray-warm text-sm">Fill in the customer details and upload the 360° frames</p>
      </header>

      {/* Order Number */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-warm uppercase tracking-wider mb-1">
              Order Number
            </label>
            <div className="flex items-center gap-3 h-11 px-4 bg-pearl border border-gray-light rounded-lg">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold flex-shrink-0">
                <rect x="2" y="3" width="12" height="10" rx="1" />
                <path d="M5 7H11M5 10H9" />
              </svg>
              <span className="font-mono font-semibold text-charcoal tracking-widest">{orderNumber}</span>
              <span className="ml-auto text-xs text-gray-warm bg-cream px-2 py-0.5 rounded">Auto-generated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Info */}
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
            <label className="block text-sm font-medium text-charcoal mb-2">
              Title <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Burmese Ruby 3.5ct"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </div>
      </section>

      {/* Tier Selection */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-xl text-charcoal mb-5">Select Tier</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tier A */}
          <label
            className={`relative flex flex-col gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              tier === 'A'
                ? 'border-gold bg-gold/5'
                : 'border-gray-light hover:border-gold/40 hover:bg-cream/30'
            }`}
          >
            <input
              type="radio"
              name="tier"
              value="A"
              checked={tier === 'A'}
              onChange={() => setTier('A')}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    tier === 'A' ? 'border-gold bg-gold' : 'border-gray-light'
                  }`}
                >
                  {tier === 'A' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-semibold text-charcoal text-lg">Tier A</span>
              </div>
              <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full">Standard</span>
            </div>
            <div className="pl-8">
              <p className="text-sm text-gray-warm">Video with Title</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-xs text-charcoal">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald flex-shrink-0"><path d="M2 6L5 9L10 3"/></svg>
                  360° interactive viewer
                </li>
                <li className="flex items-center gap-2 text-xs text-charcoal">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald flex-shrink-0"><path d="M2 6L5 9L10 3"/></svg>
                  Title overlay
                </li>
              </ul>
            </div>
          </label>

          {/* Tier B */}
          <label
            className={`relative flex flex-col gap-2 p-5 rounded-xl border-2 cursor-pointer transition-all ${
              tier === 'B'
                ? 'border-gold bg-gold/5'
                : 'border-gray-light hover:border-gold/40 hover:bg-cream/30'
            }`}
          >
            <input
              type="radio"
              name="tier"
              value="B"
              checked={tier === 'B'}
              onChange={() => setTier('B')}
              className="sr-only"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    tier === 'B' ? 'border-gold bg-gold' : 'border-gray-light'
                  }`}
                >
                  {tier === 'B' && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span className="font-semibold text-charcoal text-lg">Tier B</span>
              </div>
              <span className="text-xs font-medium text-gold bg-gold/10 px-2 py-1 rounded-full">Premium</span>
            </div>
            <div className="pl-8">
              <p className="text-sm text-gray-warm">Video + Logo + Embed Link</p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2 text-xs text-charcoal">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald flex-shrink-0"><path d="M2 6L5 9L10 3"/></svg>
                  Everything in Tier A
                </li>
                <li className="flex items-center gap-2 text-xs text-charcoal">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald flex-shrink-0"><path d="M2 6L5 9L10 3"/></svg>
                  Brand logo overlay
                </li>
                <li className="flex items-center gap-2 text-xs text-charcoal">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald flex-shrink-0"><path d="M2 6L5 9L10 3"/></svg>
                  Embed link for websites
                </li>
              </ul>
            </div>
          </label>
        </div>
      </section>

      {/* Upload Frames */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-charcoal">Upload Frames</h2>
          {imageFiles.length > 0 && (
            <span className={`text-sm font-medium ${frameStatusColor}`}>
              {frameStatusLabel}
            </span>
          )}
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
            <svg
              width="44"
              height="44"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={`mx-auto mb-4 ${frameStatus === 'low' ? 'text-ruby' : 'text-gold'}`}
            >
              <rect x="8" y="8" width="32" height="32" rx="4" />
              <path d="M24 32V20M24 20L20 24M24 20L28 24" />
            </svg>
            <h3 className="text-base font-medium text-charcoal mb-1">
              {isFrameDragActive ? 'Drop frames here' : 'Drop rotation frames here'}
            </h3>
            <p className="text-sm text-gray-warm mb-3">or click to browse JPG / PNG files</p>
            <div className="inline-flex gap-4 text-xs text-gray-cool bg-cream/50 px-4 py-2 rounded-full">
              <span>Min: {MIN_FRAMES} frames</span>
              <span>·</span>
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
            <button
              onClick={() => setImageFiles([])}
              className="text-xs text-ruby hover:text-ruby/80 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Frame thumbnail preview */}
        {imageFiles.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap max-h-32 overflow-y-auto">
            {imageFiles.slice(0, 12).map((f, i) => (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-light/50 bg-cream flex-shrink-0">
                <img
                  src={URL.createObjectURL(f)}
                  alt={`frame-${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {imageFiles.length > 12 && (
              <div className="w-14 h-14 rounded-lg bg-cream border border-gray-light/50 flex items-center justify-center text-xs text-gray-warm flex-shrink-0">
                +{imageFiles.length - 12}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Logo Upload (Tier B) */}
      {tier === 'B' && (
        <section className="bg-white rounded-xl border border-gray-light/50 p-6">
          <h2 className="font-serif text-xl text-charcoal mb-5">
            Brand Logo <span className="text-ruby">*</span>
          </h2>
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
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Logo preview"
                  className="w-16 h-16 object-contain rounded-lg border border-gray-light bg-white p-1"
                />
                <div>
                  <p className="text-sm font-medium text-charcoal">{logoFile.name}</p>
                  <p className="text-xs text-gray-warm mt-0.5">Click to replace</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setLogoFile(null); }}
                  className="ml-auto w-8 h-8 rounded-lg border border-ruby/30 hover:bg-ruby/10 text-ruby flex items-center justify-center transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3L11 11M11 3L3 11" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 text-gold">
                  <rect x="6" y="6" width="28" height="28" rx="4" />
                  <path d="M20 26V16M20 16L16 20M20 16L24 20" />
                </svg>
                <p className="text-sm font-medium text-charcoal mb-1">Drop logo here</p>
                <p className="text-xs text-gray-warm">PNG, JPG, SVG, WebP</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pb-8">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="h-12 px-8 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 14V6M9 6L6 9M9 6L12 9" />
                <rect x="3" y="3" width="12" height="12" rx="2" />
              </svg>
              Submit Order
            </>
          )}
        </button>
        <p className="text-xs text-gray-warm">
          After submitting, you can copy the link and optionally send it via WhatsApp.
        </p>
      </div>
    </div>
  );
}
