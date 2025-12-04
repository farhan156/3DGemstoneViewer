'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { useGemstoneStore } from '@/store/gemstoneStore';
import { generateGemstoneId, generateCertificateId } from '@/lib/utils';
import type { VisibilitySettings } from '@/types/gemstone';

interface UploadGemstoneProps {
  onComplete: () => void;
}

export default function UploadGemstone({ onComplete }: UploadGemstoneProps) {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [gemData, setGemData] = useState({
    name: '',
    weight: '',
    cut: '',
    origin: '',
    clarity: '',
    colorGrade: '',
  });
  const [customerData, setCustomerData] = useState({
    name: '',
    contact: '',
    email: '',
  });
  const [certData, setCertData] = useState({
    issuer: 'GIA',
    certificateNumber: '',
  });
  const [visibility, setVisibility] = useState<VisibilitySettings>({
    showName: true,
    showType: true,
    showWeight: true,
    showCut: true,
    showClarity: true,
    showColorGrade: true,
    showOrigin: true,
    showCertificate: true,
    showCustomerName: true,
    showCustomerContact: true,
    showCustomerEmail: true,
  });
  
  const addGemstone = useGemstoneStore((state) => state.addGemstone);
  const addCertificate = useGemstoneStore((state) => state.addCertificate);

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
    formData.append('folder', folder);
    
    // For PDFs, set resource_type to 'raw' or 'auto'
    const isPdf = file.type === 'application/pdf';
    const uploadUrl = isPdf 
      ? `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`
      : `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary upload error:', data);
      throw new Error(data.error?.message || 'Upload failed');
    }
    
    console.log('Uploaded to Cloudinary:', data.secure_url);
    return data.secure_url;
  };

  const onDropImages = useCallback((acceptedFiles: File[]) => {
    setImageFiles((prev) => [...prev, ...acceptedFiles]);
    toast.success(`${acceptedFiles.length} image(s) added`);
  }, []);

  const onDropCertificate = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setCertificateFile(acceptedFiles[0]);
      toast.success('Certificate uploaded');
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({
    onDrop: onDropImages,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  const { getRootProps: getCertRootProps, getInputProps: getCertInputProps, isDragActive: isCertDragActive } = useDropzone({
    onDrop: onDropCertificate,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async () => {
    if (imageFiles.length === 0) {
      toast.error('Please upload at least 1 rotation frame');
      return;
    }

    if (!customerData.name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    if (!customerData.contact.trim()) {
      toast.error('Customer contact number is required');
      return;
    }

    const loadingToast = toast.loading('Uploading to cloud storage...');

    try {
      const gemId = generateGemstoneId();

      // Upload all images to Cloudinary
      toast.loading('Uploading images...', { id: loadingToast });
      const frameUrls: string[] = [];
      for (let i = 0; i < imageFiles.length; i++) {
        const url = await uploadToCloudinary(imageFiles[i], `gemstones/${gemId}/frames`);
        frameUrls.push(url);
        toast.loading(`Uploading images... ${i + 1}/${imageFiles.length}`, { id: loadingToast });
      }

      // Create gemstone with customer data and optional fields
      const newGem: any = {
        id: gemId,
        customerName: customerData.name,
        customerContact: customerData.contact,
        status: 'completed' as const,
        frames: frameUrls,
        shareableLink: `/view/${gemId}`,
        visibility,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Add optional customer email
      if (customerData.email.trim()) newGem.customerEmail = customerData.email;

      // Add optional gemstone fields only if they have values
      if (gemData.name) newGem.name = gemData.name;
      if (gemData.weight) newGem.weight = parseFloat(gemData.weight);
      if (gemData.cut) newGem.cut = gemData.cut;
      if (gemData.origin) newGem.origin = gemData.origin;
      if (gemData.clarity) newGem.clarity = gemData.clarity;
      if (gemData.colorGrade) newGem.colorGrade = gemData.colorGrade;

      // Upload certificate if provided
      if (certificateFile) {
        toast.loading('Uploading certificate...', { id: loadingToast });
        const certUrl = await uploadToCloudinary(certificateFile, `gemstones/${gemId}/certificate`);
        const fileExtension = certificateFile.name.split('.').pop()?.toLowerCase();
        newGem.certificateUrl = certUrl;
        newGem.certificateType = (certificateFile.type.includes('pdf') ? 'pdf' : fileExtension === 'png' ? 'png' : 'jpg') as 'pdf' | 'jpg' | 'png';
      }

      toast.loading('Saving to database...', { id: loadingToast });
      await addGemstone(newGem);
      
      toast.dismiss(loadingToast);
      toast.success('Gemstone created successfully!');
      
      // Reset form
      setImageFiles([]);
      setCertificateFile(null);
      setGemData({
        name: '',
        weight: '',
        cut: '',
        origin: '',
        clarity: '',
        colorGrade: '',
      });
      setCustomerData({
        name: '',
        contact: '',
        email: '',
      });
      setCertData({
        issuer: 'GIA',
        certificateNumber: '',
      });
      setVisibility({
        showName: true,
        showType: true,
        showWeight: true,
        showCut: true,
        showClarity: true,
        showColorGrade: true,
        showOrigin: true,
        showCertificate: true,
        showCustomerName: true,
        showCustomerContact: true,
        showCustomerEmail: true,
      });
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to process images. Please try again.');
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <header className="pb-6 border-b border-gray-light/50">
        <h1 className="font-serif text-4xl text-charcoal mb-2 tracking-tight">Upload Gemstone</h1>
        <p className="text-gray-warm text-sm">Upload 360° rotation frames and certificate to create a complete gemstone entry</p>
      </header>

      {/* Customer Information */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-2xl text-charcoal mb-6">Customer Information</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Customer Name <span className="text-ruby">*</span>
            </label>
            <input
              type="text"
              value={customerData.name}
              onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
              placeholder="Full name"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Contact Number <span className="text-ruby">*</span>
            </label>
            <input
              type="tel"
              value={customerData.contact}
              onChange={(e) => setCustomerData({ ...customerData, contact: e.target.value })}
              placeholder="+1234567890"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-2">Email Address</label>
            <input
              type="email"
              value={customerData.email}
              onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
              placeholder="customer@example.com"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </div>
      </section>

      {/* Gemstone Information */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-2xl text-charcoal mb-6">Gemstone Information</h2>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Gemstone Name</label>
            <input
              type="text"
              value={gemData.name}
              onChange={(e) => setGemData({ ...gemData, name: e.target.value })}
              placeholder="e.g., Burmese Ruby"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Weight (carats)</label>
            <input
              type="number"
              step="0.01"
              value={gemData.weight}
              onChange={(e) => setGemData({ ...gemData, weight: e.target.value })}
              placeholder="e.g., 3.24"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Cut</label>
            <input
              type="text"
              value={gemData.cut}
              onChange={(e) => setGemData({ ...gemData, cut: e.target.value })}
              placeholder="e.g., Oval, Round, Cushion"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Origin</label>
            <input
              type="text"
              value={gemData.origin}
              onChange={(e) => setGemData({ ...gemData, origin: e.target.value })}
              placeholder="e.g., Myanmar, Sri Lanka"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Clarity</label>
            <input
              type="text"
              value={gemData.clarity}
              onChange={(e) => setGemData({ ...gemData, clarity: e.target.value })}
              placeholder="e.g., VVS1, VS1"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-2">Color Grade</label>
            <input
              type="text"
              value={gemData.colorGrade}
              onChange={(e) => setGemData({ ...gemData, colorGrade: e.target.value })}
              placeholder="e.g., Pigeon Blood, Royal Blue"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </div>
      </section>

      {/* Upload Rotation Frames */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-2xl text-charcoal mb-6">360° Rotation Frames</h2>
        <div
          {...getImageRootProps()}
          className={`p-12 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isImageDragActive
              ? 'border-gold bg-gold/5'
              : 'border-gray-light hover:border-gold/50 hover:bg-cream/30'
          }`}
        >
          <input {...getImageInputProps()} />
          <div className="text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto mb-6 text-gold"
            >
              <rect x="8" y="8" width="32" height="32" rx="4" />
              <path d="M24 32V20M24 20L20 24M24 20L28 24" />
              <path d="M16 16L32 16" strokeOpacity="0.3" />
            </svg>
            <h3 className="text-lg font-medium text-charcoal mb-2">Drop rotation frames here</h3>
            <p className="text-gray-warm mb-4">or click to browse files</p>
            <div className="text-sm text-gray-cool">JPG, PNG • More frames = smoother rotation (recommended: 36-72 frames)</div>
          </div>
        </div>

        {imageFiles.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between p-4 bg-cream/30 rounded-lg border border-gray-light/50 mb-4">
              <div className="flex gap-8">
                <div>
                  <span className="text-sm text-gray-warm">Frames uploaded:</span>
                  <span className="ml-2 text-sm font-semibold text-charcoal">{imageFiles.length}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-warm">Status:</span>
                  <span className={`ml-2 text-sm font-semibold ${imageFiles.length >= 36 ? 'text-gemstone-emerald' : imageFiles.length >= 12 ? 'text-gemstone-topaz' : 'text-gray-warm'}`}>
                    {imageFiles.length >= 36 ? '✓ Ready' : `Need ${36 - imageFiles.length} more`}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageFiles([]);
                  toast.success('All frames cleared');
                }}
                className="text-sm text-gray-warm hover:text-charcoal"
              >
                Clear all
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative w-20 h-20 flex-shrink-0 bg-cream rounded-lg border border-gray-light overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 bg-charcoal/80 text-white text-xs px-2 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Upload Certificate */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-2xl text-charcoal mb-6">Certificate</h2>
        <div className="grid grid-cols-2 gap-5 mb-6">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Issuer (Optional)</label>
            <select
              value={certData.issuer}
              onChange={(e) => setCertData({ ...certData, issuer: e.target.value })}
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal rounded-lg focus:outline-none focus:border-gold transition-all"
            >
              <option value="GIA">GIA (Gemological Institute of America)</option>
              <option value="AGS">AGS (American Gem Society)</option>
              <option value="IGI">IGI (International Gemological Institute)</option>
              <option value="EGL">EGL (European Gemological Laboratory)</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Certificate Number (Optional)</label>
            <input
              type="text"
              value={certData.certificateNumber}
              onChange={(e) => setCertData({ ...certData, certificateNumber: e.target.value })}
              placeholder="e.g., 2318562844"
              className="w-full h-11 px-4 bg-pearl border border-gray-light text-charcoal placeholder-gray-warm rounded-lg focus:outline-none focus:border-gold transition-all"
            />
          </div>
        </div>
        
        <div
          {...getCertRootProps()}
          className={`p-10 border-2 border-dashed rounded-xl transition-all cursor-pointer ${
            isCertDragActive
              ? 'border-gold bg-gold/5'
              : certificateFile
              ? 'border-gemstone-emerald bg-gemstone-emerald/5'
              : 'border-gray-light hover:border-gold/50 hover:bg-cream/30'
          }`}
        >
          <input {...getCertInputProps()} />
          <div className="text-center">
            {certificateFile ? (
              <>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto mb-4 text-gemstone-emerald"
                >
                  <circle cx="20" cy="20" r="15" />
                  <path d="M14 20L18 24L26 16" strokeWidth="2" />
                </svg>
                <h3 className="text-base font-medium text-charcoal mb-1">Certificate Uploaded</h3>
                <p className="text-sm text-gray-warm">{certificateFile.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCertificateFile(null);
                    toast.success('Certificate removed');
                  }}
                  className="mt-3 text-sm text-gray-warm hover:text-charcoal underline"
                >
                  Remove and upload different file
                </button>
              </>
            ) : (
              <>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="mx-auto mb-4 text-gold"
                >
                  <rect x="10" y="6" width="20" height="28" rx="2" />
                  <path d="M14 12H26M14 16H26M14 20H22" />
                  <circle cx="28" cy="28" r="6" />
                  <path d="M28 32V26M28 26L26 28M28 26L30 28" />
                </svg>
                <h3 className="text-base font-medium text-charcoal mb-1">Upload Certificate</h3>
                <p className="text-sm text-gray-warm">PDF or image file</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Visibility Settings */}
      <section className="bg-white rounded-xl border border-gray-light/50 p-6">
        <h2 className="font-serif text-2xl text-charcoal mb-4">Public Link Visibility</h2>
        <p className="text-sm text-gray-warm mb-6">Choose which information appears on the shareable public link</p>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showCustomerName}
              onChange={(e) => setVisibility({ ...visibility, showCustomerName: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Customer Name</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showCustomerContact}
              onChange={(e) => setVisibility({ ...visibility, showCustomerContact: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Customer Contact</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showCustomerEmail}
              onChange={(e) => setVisibility({ ...visibility, showCustomerEmail: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Customer Email</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showName}
              onChange={(e) => setVisibility({ ...visibility, showName: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Gemstone Name</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showType}
              onChange={(e) => setVisibility({ ...visibility, showType: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Type</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showWeight}
              onChange={(e) => setVisibility({ ...visibility, showWeight: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Weight</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showCut}
              onChange={(e) => setVisibility({ ...visibility, showCut: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Cut</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showClarity}
              onChange={(e) => setVisibility({ ...visibility, showClarity: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Clarity</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showColorGrade}
              onChange={(e) => setVisibility({ ...visibility, showColorGrade: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Color Grade</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showOrigin}
              onChange={(e) => setVisibility({ ...visibility, showOrigin: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Origin</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream/30 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={visibility.showCertificate}
              onChange={(e) => setVisibility({ ...visibility, showCertificate: e.target.checked })}
              className="w-5 h-5 rounded border-gray-light text-gold focus:ring-gold focus:ring-offset-0"
            />
            <span className="text-sm font-medium text-charcoal">Show Certificate</span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex justify-end gap-4 pb-8">
        <button
          onClick={() => {
            setImageFiles([]);
            setCertificateFile(null);
            setGemData({
              name: '',
              weight: '',
              cut: '',
              origin: '',
              clarity: '',
              colorGrade: '',
            });
            setCertData({
              issuer: 'GIA',
              certificateNumber: '',
            });
            toast.success('Form cleared');
          }}
          className="h-11 px-6 bg-white border border-gray-light text-charcoal hover:bg-cream rounded-lg transition-all"
        >
          Clear Form
        </button>
        <button
          onClick={handleSubmit}
          disabled={imageFiles.length < 36}
          className="h-11 px-8 bg-gold text-white hover:bg-gold-dark rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md disabled:shadow-none"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="7" />
            <path d="M6 9L8 11L12 7" />
          </svg>
          Create Gemstone
        </button>
      </div>
    </div>
  );
}
