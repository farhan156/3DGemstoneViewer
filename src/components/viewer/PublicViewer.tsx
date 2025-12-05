'use client';

import { useState, useRef, useEffect } from 'react';
import { Gemstone } from '@/types/gemstone';

interface PublicViewerProps {
  gemstone: Gemstone;
}

export default function PublicViewer({ gemstone }: PublicViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const dragStartX = useRef(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<HTMLImageElement[]>([]);
  const animationFrame = useRef<number>();

  // Debug: Log certificate data
  useEffect(() => {
    console.log('Gemstone data:', {
      hasCertificateUrl: !!gemstone.certificateUrl,
      certificateUrl: gemstone.certificateUrl,
      certificateType: gemstone.certificateType,
      showCertificate: visibility.showCertificate
    });
  }, [gemstone]);

  const visibility = gemstone.visibility || {
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
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gemstone.frames) return;
    
    const delta = e.clientX - dragStartX.current;
    const sensitivity = 3;
    const frameDelta = Math.floor(delta / sensitivity);
    
    if (frameDelta !== 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (drag right = rotate right)
        const newFrame = (currentFrame - frameDelta + gemstone.frames.length) % gemstone.frames.length;
        setCurrentFrame(newFrame);
        dragStartX.current = e.clientX;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !gemstone.frames) return;
    
    const delta = e.touches[0].clientX - dragStartX.current;
    const sensitivity = 2; // More sensitive for mobile
    const frameDelta = Math.floor(delta / sensitivity);
    
    if (frameDelta !== 0) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      
      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (swipe right = rotate right)
        const newFrame = (currentFrame - frameDelta + gemstone.frames.length) % gemstone.frames.length;
        setCurrentFrame(newFrame);
        dragStartX.current = e.touches[0].clientX;
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const rotateLeft = () => {
    if (!gemstone.frames) return;
    setCurrentFrame((prev) => (prev - 1 + gemstone.frames.length) % gemstone.frames.length);
  };

  const rotateRight = () => {
    if (!gemstone.frames) return;
    setCurrentFrame((prev) => (prev + 1) % gemstone.frames.length);
  };

  // Preload all images for smooth transitions
  useEffect(() => {
    if (!gemstone.frames || gemstone.frames.length === 0) return;

    const loadImages = async () => {
      const promises = gemstone.frames.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      });

      try {
        imageCache.current = await Promise.all(promises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images:', error);
        setImagesLoaded(true); // Still show images even if some fail
      }
    };

    loadImages();
  }, [gemstone.frames]);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-pearl">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 bg-white/95 backdrop-blur-sm border-b border-gray-light/50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-gold">
            <path
              d="M16 2L6 10L8 24L16 30L24 24L26 10L16 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="bevel"
              fill="currentColor"
              fillOpacity="0.1"
            />
            <path d="M16 2V30M6 10H26M8 24H24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="text-charcoal font-serif font-semibold text-base tracking-wide">GEMSTONE VIEWER</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8 pt-24 md:pt-28 pb-8 md:pb-16">
        <div className="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 md:gap-8 items-start lg:items-center">
          {/* 360° Viewer */}
          <div className="relative w-full max-w-3xl mx-auto aspect-square">
            <div 
              ref={viewerRef}
              className={`w-full h-full bg-cream border border-gray-light/50 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg overflow-hidden touch-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {gemstone.frames && gemstone.frames.length > 0 ? (
                <>
                  {!imagesLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-cream/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                    </div>
                  )}
                  <img
                    src={gemstone.frames[currentFrame]}
                    alt={`${gemstone.name || 'Gemstone'} - Frame ${currentFrame + 1}`}
                    className="w-full h-full object-contain select-none"
                    style={{ 
                      opacity: imagesLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease-in-out',
                      imageRendering: 'crisp-edges',
                      willChange: 'transform'
                    }}
                    draggable="false"
                    loading="eager"
                  />
                </>
              ) : (
                <div
                  className="w-96 h-96 relative animate-float"
                  style={{
                    background: `radial-gradient(circle at center, ${
                      gemstone.type === 'ruby'
                        ? 'rgba(196,30,58,0.08)'
                        : gemstone.type === 'sapphire'
                        ? 'rgba(15,82,186,0.08)'
                        : gemstone.type === 'emerald'
                        ? 'rgba(80,200,120,0.08)'
                        : 'rgba(212,175,55,0.08)'
                    }, transparent 70%)`,
                  }}
                >
                  <div className="w-full h-full transform rotate-45">
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 via-transparent to-transparent border-3 border-gold/30 relative animate-gem-rotate rounded-lg">
                      <div className="absolute top-1/5 left-1/5 w-3/5 h-3/5 bg-gradient-to-br from-gold/15 to-transparent border-2 border-gold/20 rounded">
                        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-gold/25 to-transparent border border-gold/15 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 p-2 md:p-3 bg-white/95 backdrop-blur-md border border-gray-light/50 rounded-lg shadow-lg">
              <button 
                onClick={rotateLeft}
                className="w-9 h-9 md:w-10 md:h-10 border border-gray-light active:bg-cream hover:bg-cream text-charcoal transition-all flex items-center justify-center rounded touch-manipulation"
                title="Rotate left"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 5L8 9L11 13" />
                  <circle cx="9" cy="9" r="7" />
                </svg>
              </button>
              <div className="flex items-center justify-center min-w-[70px] md:min-w-[80px] text-xs text-charcoal font-mono">
                <span className="font-semibold">{currentFrame + 1}</span>
                <span className="text-gray-warm mx-1">/</span>
                <span className="text-gray-warm">{gemstone.frames?.length || 0}</span>
              </div>
              <button 
                onClick={rotateRight}
                className="w-9 h-9 md:w-10 md:h-10 border border-gray-light active:bg-cream hover:bg-cream text-charcoal transition-all flex items-center justify-center rounded touch-manipulation"
                title="Rotate right"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 5L10 9L7 13" />
                  <circle cx="9" cy="9" r="7" />
                </svg>
              </button>
            </div>

            <div className="absolute top-3 md:top-6 left-1/2 -translate-x-1/2 text-xs text-gray-warm bg-white/90 px-3 md:px-5 py-1.5 md:py-2 backdrop-blur-sm border border-gray-light/50 rounded-full shadow-sm">
              <span className="hidden md:inline">Drag to rotate · Click arrows to navigate</span>
              <span className="md:hidden">Swipe to rotate</span>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-white border border-gray-light/50 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-6 shadow-lg">
            {visibility.showName && gemstone.name && (
              <div className="pb-6 border-b border-gray-light/50">
                <h1 className="font-serif text-4xl text-charcoal mb-2 tracking-tight leading-tight">{gemstone.name}</h1>
                {visibility.showType && gemstone.type && (
                  <p className="text-gray-warm text-sm mb-1 capitalize">{gemstone.type}</p>
                )}
                <p className="text-gray-cool text-xs font-mono tracking-wide">ID: {gemstone.id}</p>
              </div>
            )}

            <div className="space-y-3">
              {visibility.showCustomerName && gemstone.customerName && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Customer Name</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.customerName}</span>
                </div>
              )}
              {visibility.showCustomerContact && gemstone.customerContact && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Contact</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.customerContact}</span>
                </div>
              )}
              {visibility.showCustomerEmail && gemstone.customerEmail && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Email</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.customerEmail}</span>
                </div>
              )}
              {visibility.showWeight && gemstone.weight && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Weight</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.weight} carats</span>
                </div>
              )}
              {visibility.showCut && gemstone.cut && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Cut</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.cut}</span>
                </div>
              )}
              {visibility.showClarity && gemstone.clarity && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Clarity</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.clarity}</span>
                </div>
              )}
              {visibility.showColorGrade && gemstone.colorGrade && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Color Grade</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.colorGrade}</span>
                </div>
              )}
              {visibility.showOrigin && gemstone.origin && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                  <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">Origin</span>
                  <span className="text-sm font-medium text-charcoal">{gemstone.origin}</span>
                </div>
              )}
            </div>

            {visibility.showCertificate && gemstone.certificateUrl && (
              <div className="p-5 bg-cream/50 border border-gold/20 rounded-lg border-l-4 border-l-gold">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center text-gold">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="6" y="4" width="12" height="16" rx="1" />
                      <path d="M10 8H14M10 12H14" />
                      <circle cx="18" cy="18" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-charcoal mb-0.5">Certification</div>
                    <div className="text-xs font-mono text-gray-warm">Certificate Available</div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCertificate(true)}
                  className="w-full h-11 bg-gold text-white font-medium text-sm hover:bg-gold-dark rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="9" cy="9" r="6" />
                    <circle cx="9" cy="9" r="2" />
                  </svg>
                  View Certificate
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-center">
        <p className="text-sm text-smoke">
          Powered by <span className="text-silver font-medium">Gemstone Forge</span> · 360° Interactive Gemstone
          Platform
        </p>
      </footer>

      {/* Certificate Modal */}
      {showCertificate && gemstone.certificateUrl && (
        <div 
          className="fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-sm flex items-center justify-center p-2 md:p-8"
          onClick={() => setShowCertificate(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-light/50 p-3 md:p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base md:text-lg font-serif font-semibold text-charcoal">Certificate</h3>
                <p className="text-xs md:text-sm text-gray-warm">Gemstone Certificate</p>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg active:bg-cream hover:bg-cream transition-all text-gray-warm hover:text-charcoal touch-manipulation"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 6L14 14M14 6L6 14" />
                </svg>
              </button>
            </div>
            <div className="p-3 md:p-6">
              {gemstone.certificateType === 'pdf' ? (
                <>
                  {/* PDF Viewer for mobile and desktop */}
                  <iframe
                    src={`${gemstone.certificateUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-[60vh] md:h-[70vh] rounded-lg border border-gray-light"
                    title="Certificate Preview"
                  />
                  <a
                    href={gemstone.certificateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 block w-full py-2.5 bg-gold text-white text-center rounded-lg hover:bg-gold-dark transition-all text-sm font-medium"
                  >
                    Open PDF in New Tab
                  </a>
                </>
              ) : (
                <img
                  src={gemstone.certificateUrl}
                  alt="Certificate"
                  className="w-full h-auto rounded-lg border border-gray-light"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
