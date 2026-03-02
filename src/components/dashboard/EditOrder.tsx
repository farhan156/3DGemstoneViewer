'use client';

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { useGemstoneStore } from '@/store/gemstoneStore';
import type { Gemstone } from '@/types/gemstone';

interface EditOrderProps {
  order: Gemstone;
  onClose: () => void;
}

export default function EditOrder({ order, onClose }: EditOrderProps) {
  const updateGemstone = useGemstoneStore((state) => state.updateGemstone);

  const [customerName, setCustomerName] = useState(order.customerName);
  const [phoneNumber, setPhoneNumber] = useState(order.customerContact);
  const [title, setTitle] = useState(order.title || '');
  const [tier, setTier] = useState<'A' | 'B'>(order.tier || 'A');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', folder);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Upload failed');
    return data.secure_url;
  };

  const onDropLogo = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setLogoFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.svg', '.webp'] },
    maxFiles: 1,
  });

  const handleSave = async () => {
    if (!customerName.trim()) { toast.error('Customer name is required'); return; }
    if (!phoneNumber.trim()) { toast.error('Phone number is required'); return; }
    if (!title.trim()) { toast.error('Title is required'); return; }
    if (tier === 'B' && !logoFile && !order.logoUrl) {
      toast.error('Please upload a logo for Tier B'); return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading('Saving…');
    try {
      let logoUrl = order.logoUrl;
      if (logoFile) {
        toast.loading('Uploading logo…', { id: loadingToast });
        logoUrl = await uploadToCloudinary(logoFile, `orders/${order.id}/logo`);
      }

      // Build update payload — never include undefined (Firestore rejects it)
      const updates: Record<string, any> = {
        customerName,
        customerContact: phoneNumber,
        tier,
      };
      if (title.trim()) updates.title = title.trim();
      if (tier === 'B' && logoUrl) updates.logoUrl = logoUrl;

      await updateGemstone(order.id, updates);

      toast.dismiss(loadingToast);
      toast.success('Order updated successfully!');
      onClose();
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error('Failed to save changes.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-light/50">
          <div>
            <h2 className="font-serif text-xl text-charcoal">Edit Order</h2>
            <p className="text-xs text-gray-warm font-mono mt-0.5">{order.orderNumber || order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-cream flex items-center justify-center text-gray-warm hover:text-charcoal transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4L14 14M14 4L4 14" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Customer Name <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
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
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Title <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>

          {/* Tier */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">Tier</label>
            <div className="grid grid-cols-2 gap-3">
              {(['A', 'B'] as const).map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tier === t ? 'border-gold bg-gold/5' : 'border-gray-light hover:border-gold/40'
                  }`}
                >
                  <input
                    type="radio"
                    name="edit-tier"
                    value={t}
                    checked={tier === t}
                    onChange={() => setTier(t)}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${tier === t ? 'border-gold bg-gold' : 'border-gray-light'}`}>
                    {tier === t && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal text-sm">Tier {t}</div>
                    <div className="text-xs text-gray-warm">{t === 'A' ? 'Video + Title' : 'Video + Logo + Link'}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Logo (Tier B) */}
          {tier === 'B' && (
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Logo {!order.logoUrl && <span className="text-ruby">*</span>}
              </label>
              <div
                {...getRootProps()}
                className={`p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  isDragActive ? 'border-gold bg-gold/5' : 'border-gray-light hover:border-gold/40'
                }`}
              >
                <input {...getInputProps()} />
                {logoFile ? (
                  <div className="flex items-center gap-3">
                    <img src={URL.createObjectURL(logoFile)} alt="New logo" className="w-12 h-12 object-contain rounded-lg border border-gray-light bg-pearl p-1" />
                    <span className="text-sm text-charcoal">{logoFile.name}</span>
                  </div>
                ) : order.logoUrl ? (
                  <div className="flex items-center gap-3">
                    <img src={order.logoUrl} alt="Current logo" className="w-12 h-12 object-contain rounded-lg border border-gray-light bg-pearl p-1" />
                    <span className="text-sm text-gray-warm">Current logo · Click to replace</span>
                  </div>
                ) : (
                  <p className="text-sm text-center text-gray-warm">Drop or click to upload logo</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-light/50">
          <button
            onClick={onClose}
            className="flex-1 h-11 border border-gray-light text-charcoal font-medium text-sm rounded-xl hover:bg-cream transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 h-11 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-dark disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
