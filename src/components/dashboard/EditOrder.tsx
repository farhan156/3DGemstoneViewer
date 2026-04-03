"use client";

import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useGemstoneStore } from "@/store/gemstoneStore";
import {
  generateUniqueOrderNumber,
  getFrameValidationMessage,
  isValidPhoneNumber,
  normalizePhoneNumber,
  validateFrameFile,
} from "@/lib/utils";
import type { Gemstone } from "@/types/gemstone";

interface EditOrderProps {
  order: Gemstone;
  onClose: () => void;
}

const MIN_FRAMES = 24;
const IDEAL_FRAMES = 36;

export default function EditOrder({ order, onClose }: EditOrderProps) {
  const updateGemstone = useGemstoneStore((state) => state.updateGemstone);
  const gemstones = useGemstoneStore((state) => state.gemstones);

  const [orderNumber, setOrderNumber] = useState(order.orderNumber || "");
  const [customerName, setCustomerName] = useState(order.customerName);
  const [phoneNumber, setPhoneNumber] = useState(order.customerContact);
  const [title, setTitle] = useState(order.title || "");
  const [tier, setTier] = useState<"A" | "B">(order.tier || "A");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [frameFiles, setFrameFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const isDraft = order.status === "draft";
  const totalFrames = (order.frames?.length || 0) + frameFiles.length;
  const frameStatusLabel = getFrameValidationMessage(
    totalFrames,
    MIN_FRAMES,
    IDEAL_FRAMES,
  );

  const uploadToCloudinary = async (
    file: File,
    folder: string,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
    );
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
  };

  const onDropLogo = useCallback((accepted: File[]) => {
    if (accepted.length > 0) setLogoFile(accepted[0]);
  }, []);

  const onDropFrames = useCallback((accepted: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];

    accepted.forEach((file) => {
      const error = validateFrameFile(file);
      if (error) {
        errors.push(error);
      } else {
        valid.push(file);
      }
    });

    if (valid.length > 0) {
      setFrameFiles((prev) => [...prev, ...valid]);
      toast.success(`${valid.length} frame(s) added`);
    }

    if (errors.length > 0) {
      toast.error(errors[0]);
    }
  }, []);

  const onDropRejectedFrames = useCallback((rejections: FileRejection[]) => {
    const first = rejections[0];
    if (!first?.errors[0]) return;
    toast.error(first.errors[0].message);
  }, []);

  const {
    getRootProps: getLogoRootProps,
    getInputProps: getLogoInputProps,
    isDragActive: isLogoDragActive,
  } = useDropzone({
    onDrop: onDropLogo,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const {
    getRootProps: getFrameRootProps,
    getInputProps: getFrameInputProps,
    isDragActive: isFrameDragActive,
  } = useDropzone({
    onDrop: onDropFrames,
    onDropRejected: onDropRejectedFrames,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxSize: 10 * 1024 * 1024,
  });

  const uploadNewFrames = async (toastId: string): Promise<string[]> => {
    const uploaded: string[] = [];
    for (let i = 0; i < frameFiles.length; i += 1) {
      toast.loading(`Uploading frames... ${i + 1}/${frameFiles.length}`, {
        id: toastId,
      });
      const url = await uploadToCloudinary(
        frameFiles[i],
        `orders/${order.id}/frames`,
      );
      uploaded.push(url);
    }
    return uploaded;
  };

  const buildSharedUpdates = async (
    toastId: string,
  ): Promise<Partial<Gemstone>> => {
    let logoUrl = order.logoUrl;
    if (logoFile) {
      toast.loading("Uploading logo...", { id: toastId });
      logoUrl = await uploadToCloudinary(logoFile, `orders/${order.id}/logo`);
    }

    let certificateUrl = order.certificateUrl;
    if (certificateFile) {
      toast.loading("Uploading certificate...", { id: toastId });
      certificateUrl = await uploadToCloudinary(
        certificateFile,
        `orders/${order.id}/certificate`,
      );
    }

    const uploadedFrames =
      frameFiles.length > 0 ? await uploadNewFrames(toastId) : [];

    const updates: Partial<Gemstone> = {
      orderNumber: orderNumber.trim(),
      customerName: customerName.trim(),
      customerContact: normalizePhoneNumber(phoneNumber),
      tier,
      frames: [...(order.frames || []), ...uploadedFrames],
    };

    if (title.trim()) {
      updates.title = title.trim();
    }

    if (tier === "A" && logoUrl) {
      updates.logoUrl = logoUrl;
    }

    if (tier === "A" && certificateUrl) {
      updates.certificateUrl = certificateUrl;
    }

    return updates;
  };

  const handleSave = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
      toast.error("Enter a valid phone number");
      return;
    }

    if (!isDraft && !title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!isDraft && tier === "A" && !logoFile && !order.logoUrl) {
      toast.error("Please upload a logo for Tier A");
      return;
    }

    setIsSaving(true);
    const loadingToast = toast.loading("Saving changes...");

    try {
      const updates = await buildSharedUpdates(loadingToast);
      await updateGemstone(order.id, updates);

      toast.dismiss(loadingToast);
      toast.success(isDraft ? "Draft updated" : "Order updated successfully");
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save changes");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isDraft) return;

    if (!customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!phoneNumber.trim() || !isValidPhoneNumber(phoneNumber)) {
      toast.error("Enter a valid phone number");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required to publish");
      return;
    }

    if (totalFrames < MIN_FRAMES) {
      toast.error(`At least ${MIN_FRAMES} frames are required to publish`);
      return;
    }

    if (tier === "A" && !logoFile && !order.logoUrl) {
      toast.error("Tier A requires a logo before publishing");
      return;
    }

    setIsPublishing(true);
    const loadingToast = toast.loading("Publishing draft...");

    try {
      const updates = await buildSharedUpdates(loadingToast);

      updates.status = "completed";
      updates.shareableLink = `/view/${order.id}`;
      if (!updates.orderNumber) {
        updates.orderNumber = generateUniqueOrderNumber(
          gemstones.map((item) => item.orderNumber || ""),
        );
      }

      await updateGemstone(order.id, updates);

      toast.dismiss(loadingToast);
      toast.success("Draft published");
      onClose();
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to publish draft");
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-light/50">
          <div>
            <h2 className="font-serif text-xl text-charcoal">
              {isDraft ? "Edit Draft" : "Edit Order"}
            </h2>
            <p className="text-xs text-gray-warm font-mono mt-0.5">
              {order.orderNumber || order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-cream flex items-center justify-center text-gray-warm hover:text-charcoal transition-all"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4L14 14M14 4L4 14" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Order Number
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal rounded-lg focus:outline-none focus:border-gold font-mono transition-all"
              placeholder="e.g. ORD-00001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Customer Name <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal rounded-lg focus:outline-none focus:border-gold transition-all"
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
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Title {isDraft ? "" : <span className="text-ruby">*</span>}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-3">
              Tier
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    tier === t
                      ? "border-gold bg-gold/5"
                      : "border-gray-light hover:border-gold/40"
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
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      tier === t ? "border-gold bg-gold" : "border-gray-light"
                    }`}
                  >
                    {tier === t && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-charcoal text-sm">
                      Tier {t}
                    </div>
                    <div className="text-xs text-gray-warm">
                      {t === "A" ? "Video + Logo + Link" : "Video + Title"}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Frames
            </label>
            <div
              {...getFrameRootProps()}
              className={`p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isFrameDragActive
                  ? "border-gold bg-gold/5"
                  : "border-gray-light hover:border-gold/40"
              }`}
            >
              <input {...getFrameInputProps()} />
              <p className="text-sm text-charcoal text-center">
                Drop or click to add frames (PNG, JPG, WebP)
              </p>
              <p className="text-xs text-gray-warm text-center mt-1">
                Current: {order.frames?.length || 0}, New: {frameFiles.length},
                Total: {totalFrames}
              </p>
              <p className="text-xs text-center mt-1 text-gray-warm">
                {frameStatusLabel}
              </p>
            </div>
            {frameFiles.length > 0 && (
              <button
                onClick={() => setFrameFiles([])}
                className="mt-2 text-xs text-ruby hover:text-ruby/80 transition-colors"
              >
                Clear newly added frames
              </button>
            )}
          </div>

          {tier === "A" && (
            <>
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Logo{" "}
                  {!order.logoUrl && !logoFile && !isDraft && (
                    <span className="text-ruby">*</span>
                  )}
                </label>
                <div
                  {...getLogoRootProps()}
                  className={`p-5 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                    isLogoDragActive
                      ? "border-gold bg-gold/5"
                      : "border-gray-light hover:border-gold/40"
                  }`}
                >
                  <input {...getLogoInputProps()} />
                  {logoFile ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(logoFile)}
                        alt="New logo"
                        className="w-12 h-12 object-contain rounded-lg border border-gray-light bg-pearl p-1"
                      />
                      <span className="text-sm text-charcoal">
                        {logoFile.name}
                      </span>
                    </div>
                  ) : order.logoUrl ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={order.logoUrl}
                        alt="Current logo"
                        className="w-12 h-12 object-contain rounded-lg border border-gray-light bg-pearl p-1"
                      />
                      <span className="text-sm text-gray-warm">
                        Current logo - click to replace
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-center text-gray-warm">
                      Drop or click to upload logo
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Certificate (Optional)
                </label>
                <div className="border-2 border-dashed rounded-xl transition-all cursor-pointer p-5 border-gray-light hover:border-gold/40">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setCertificateFile(e.target.files?.[0] || null)
                    }
                    className="hidden"
                    id="certificate-input"
                  />
                  <label
                    htmlFor="certificate-input"
                    className="cursor-pointer block"
                  >
                    {certificateFile ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gold"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-charcoal">
                          {certificateFile.name}
                        </span>
                      </div>
                    ) : order.certificateUrl ? (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gold"
                          >
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-warm">
                          Current certificate - click to replace
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-center text-gray-warm">
                        Drop or click to upload certificate (PDF, JPG, or PNG)
                      </p>
                    )}
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 px-6 py-4 border-t border-gray-light/50">
          <button
            onClick={onClose}
            className="h-11 px-5 border border-gray-light text-charcoal font-medium text-sm rounded-xl hover:bg-cream transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isPublishing}
            className="h-11 px-5 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-dark disabled:opacity-60 transition-all"
          >
            {isSaving ? "Saving..." : isDraft ? "Save Draft" : "Save Changes"}
          </button>
          {isDraft && (
            <button
              onClick={handlePublish}
              disabled={isSaving || isPublishing}
              className="h-11 px-5 bg-emerald text-white font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isPublishing ? "Publishing..." : "Submit & Publish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
