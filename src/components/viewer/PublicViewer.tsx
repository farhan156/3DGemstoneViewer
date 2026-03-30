"use client";

import { useState, useRef, useEffect } from "react";
import { Gemstone } from "@/types/gemstone";

interface PublicViewerProps {
  gemstone: Gemstone;
}

// Toggle header style: "image" or "gradient"
const HEADER_STYLE = "image";

export default function PublicViewer({ gemstone }: PublicViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHintModal, setShowHintModal] = useState(true);
  const dragStartX = useRef(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<HTMLImageElement[]>([]);
  const animationFrame = useRef<number>();
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(25); // milliseconds between frames - much faster for smooth playback
  const currentFrameRef = useRef(0); // Track frame without state batching
  const dragOccurredRef = useRef(false); // Track if actual drag occurred

  // Auto-rotation when playing using requestAnimationFrame for smooth animation
  useEffect(() => {
    let frameId: number | null = null;

    const animate = (currentTime: number) => {
      if (!isPlaying || !gemstone.frames || gemstone.frames.length === 0)
        return;

      // Advance frame if enough time has passed
      if (currentTime - lastFrameTimeRef.current >= frameIntervalRef.current) {
        currentFrameRef.current =
          (currentFrameRef.current + 1) % gemstone.frames.length;
        setCurrentFrame(currentFrameRef.current);
        lastFrameTimeRef.current = currentTime;
      }

      // Continue animation loop
      frameId = requestAnimationFrame(animate);
    };

    if (isPlaying && gemstone.frames && gemstone.frames.length > 0) {
      // Sync ref with current state
      currentFrameRef.current = currentFrame;
      lastFrameTimeRef.current = performance.now();
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, gemstone.frames]);

  // Pause when user drags
  const pauseOnDrag = () => {
    if (isPlaying) setIsPlaying(false);
  };

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
    dragOccurredRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gemstone.frames) return;

    const delta = e.clientX - dragStartX.current;
    const sensitivity = 5;
    const frameDelta = Math.floor(delta / sensitivity);

    if (frameDelta !== 0) {
      dragOccurredRef.current = true;
      pauseOnDrag();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (drag right = rotate right)
        const newFrame =
          (currentFrameRef.current - frameDelta + gemstone.frames.length) %
          gemstone.frames.length;
        currentFrameRef.current = newFrame;
        setCurrentFrame(newFrame);
        dragStartX.current = e.clientX;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // If no drag occurred, toggle play/pause on click
    if (!dragOccurredRef.current) {
      setIsPlaying((p) => !p);
    }
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    // Don't toggle play state on mouse leave, just stop dragging
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragOccurredRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !gemstone.frames) return;

    const delta = e.touches[0].clientX - dragStartX.current;
    const sensitivity = 4; // More sensitive for mobile
    const frameDelta = Math.floor(delta / sensitivity);

    if (frameDelta !== 0) {
      dragOccurredRef.current = true;
      pauseOnDrag();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (swipe right = rotate right)
        const newFrame =
          (currentFrameRef.current - frameDelta + gemstone.frames.length) %
          gemstone.frames.length;
        currentFrameRef.current = newFrame;
        setCurrentFrame(newFrame);
        dragStartX.current = e.touches[0].clientX;
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If no drag occurred, toggle play/pause on tap
    if (!dragOccurredRef.current) {
      setIsPlaying((p) => !p);
    }
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    // Don't toggle on cancel, just stop dragging
  };

  const rotateLeft = () => {
    if (!gemstone.frames) return;
    const newFrame =
      (currentFrameRef.current - 1 + gemstone.frames.length) %
      gemstone.frames.length;
    currentFrameRef.current = newFrame;
    setCurrentFrame(newFrame);
  };

  const rotateRight = () => {
    if (!gemstone.frames) return;
    const newFrame = (currentFrameRef.current + 1) % gemstone.frames.length;
    currentFrameRef.current = newFrame;
    setCurrentFrame(newFrame);
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
        console.error("Error preloading images:", error);
        setImagesLoaded(true); // Still show images even if some fail
      }
    };

    loadImages();
  }, [gemstone.frames]);

  // Show hint modal and fade it away after 1.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHintModal(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <style>{`
        /* Ultra-modern smooth scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #af1416;
          border-radius: 4px;
          box-shadow: 0 0 6px rgba(175, 20, 22, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #d63c42;
          box-shadow: 0 0 12px rgba(175, 20, 22, 0.6);
          width: 10px;
        }
        
        ::-webkit-scrollbar-thumb:active {
          background: #7d0f12;
          box-shadow: 0 0 16px rgba(175, 20, 22, 0.8);
        }
        
        /* Firefox scrollbar */
        * {
          scrollbar-color: #af1416 transparent;
          scrollbar-width: thin;
        }
      `}</style>
      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-center"
        style={
          HEADER_STYLE === "image"
            ? {
                backgroundImage: "url('/Header.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                boxShadow: "0 12px 24px rgba(74, 4, 4, 0.2)",
              }
            : {
                background: `
                  url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="6" seed="1" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter></defs><rect width="200" height="200" fill="%23000000" filter="url(%23noise)" opacity="0.25"/></svg>'),
                  linear-gradient(90deg, %2306050a 0%%, %2334262d 12%%, %2383070c 28%%, %23e73e3d 52%%, %23f16761 76%%, %23811621 100%%)
                `,
                backgroundBlendMode: "overlay",
                backgroundSize: "100% 100%, 100% 100%",
                boxShadow: "0 12px 24px rgba(74, 4, 4, 0.2)",
              }
        }
      >
        <style>{`
          @font-face {
            font-family: 'Kind Avenue';
            src: url('/fonts/Kind-Avenue.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>
        <span
          style={{
            fontFamily: "'Kind Avenue', sans-serif",
            fontSize: "36px",
            fontWeight: "400",
            color: "white",
            letterSpacing: "-1px",
            textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
          }}
        >
          The Facet Studio
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8 pt-24 md:pt-28 pb-8 md:pb-16">
        <div
          className={`max-w-screen-2xl w-full ${gemstone.tier === "A" ? "flex flex-col items-center" : "grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-4 md:gap-8 items-start lg:items-center"}`}
        >
          {/* 360° Viewer */}
          <div className="relative w-full max-w-3xl mx-auto aspect-square">
            <div
              ref={viewerRef}
              className={`w-full h-full bg-white flex items-center justify-center overflow-hidden touch-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
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
                    alt={`${gemstone.name || "Gemstone"} - Frame ${currentFrame + 1}`}
                    className="w-full h-full object-contain select-none"
                    style={{
                      opacity: imagesLoaded ? 1 : 0,
                      transition: "opacity 0.3s ease-in-out",
                      imageRendering: "crisp-edges",
                      willChange: "transform",
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
                      gemstone.type === "ruby"
                        ? "rgba(196,30,58,0.08)"
                        : gemstone.type === "sapphire"
                          ? "rgba(15,82,186,0.08)"
                          : gemstone.type === "emerald"
                            ? "rgba(80,200,120,0.08)"
                            : "rgba(212,175,55,0.08)"
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

            {/* Logo overlay (Tier B) */}
            {gemstone.tier === "B" && gemstone.logoUrl && (
              <div className="absolute bottom-16 md:bottom-20 right-3 md:right-5 z-10 pointer-events-none">
                <img
                  src={gemstone.logoUrl}
                  alt="Brand logo"
                  className="w-12 h-12 md:w-16 md:h-16 object-contain opacity-80"
                />
              </div>
            )}

            {/* Hint Modal - Desktop only */}
            {showHintModal && (
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none transition-opacity duration-500 ${
                  showHintModal ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  animation: showHintModal
                    ? "fadeOut 1.5s ease-in-out forwards"
                    : "none",
                }}
              >
                <style>{`
                  @keyframes fadeOut {
                    0% {
                      opacity: 1;
                    }
                    80% {
                      opacity: 1;
                    }
                    100% {
                      opacity: 0;
                    }
                  }
                `}</style>
                <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium text-sm shadow-lg">
                  Tap to pause · Drag to rotate
                </div>
              </div>
            )}
          </div>

          {/* Floating Info Bar for Tier A */}
          {gemstone.tier === "A" && gemstone.title && (
            <div className="mt-6 w-full max-w-3xl mx-auto px-6 md:px-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <h2 className="text-lg md:text-xl font-serif text-charcoal tracking-tight">
                  {gemstone.title}
                </h2>
                <span className="text-sm text-charcoal font-mono tracking-wide">
                  Gemstone #{gemstone.id}
                </span>
              </div>
            </div>
          )}

          {/* Information Panel - Only for Tier B */}
          {gemstone.tier === "B" && (
            <div className="bg-white border border-gray-light/50 rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-6 shadow-lg">
              {/* Title (Tier A & B) */}
              {gemstone.title && (
                <div className="pb-5 border-b border-gray-light/50">
                  <h1 className="font-serif text-3xl md:text-4xl text-charcoal mb-1 tracking-tight leading-tight">
                    {gemstone.title}
                  </h1>
                  {gemstone.tier && (
                    <span
                      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${
                        gemstone.tier === "B"
                          ? "bg-gold/15 text-gold"
                          : "bg-cream text-charcoal"
                      }`}
                    >
                      Tier {gemstone.tier}
                    </span>
                  )}
                </div>
              )}

              {/* Legacy name fallback */}
              {!gemstone.title && visibility.showName && gemstone.name && (
                <div className="pb-6 border-b border-gray-light/50">
                  <h1 className="font-serif text-4xl text-charcoal mb-2 tracking-tight leading-tight">
                    {gemstone.name}
                  </h1>
                  {visibility.showType && gemstone.type && (
                    <p className="text-gray-warm text-sm mb-1 capitalize">
                      {gemstone.type}
                    </p>
                  )}
                  <p className="text-gray-cool text-xs font-mono tracking-wide">
                    ID: {gemstone.id}
                  </p>
                </div>
              )}

              {/* Tier B logo in panel */}
              {gemstone.tier === "B" && gemstone.logoUrl && (
                <div className="flex items-center gap-3 pb-4 border-b border-gray-light/50">
                  <img
                    src={gemstone.logoUrl}
                    alt="Brand logo"
                    className="w-10 h-10 object-contain"
                  />
                </div>
              )}

              <div className="space-y-3">
                {visibility.showCustomerName && gemstone.customerName && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Customer Name
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.customerName}
                    </span>
                  </div>
                )}
                {visibility.showCustomerContact && gemstone.customerContact && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Contact
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.customerContact}
                    </span>
                  </div>
                )}
                {visibility.showCustomerEmail && gemstone.customerEmail && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Email
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.customerEmail}
                    </span>
                  </div>
                )}
                {visibility.showWeight && gemstone.weight && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Weight
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.weight} carats
                    </span>
                  </div>
                )}
                {visibility.showCut && gemstone.cut && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Cut
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.cut}
                    </span>
                  </div>
                )}
                {visibility.showClarity && gemstone.clarity && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Clarity
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.clarity}
                    </span>
                  </div>
                )}
                {visibility.showColorGrade && gemstone.colorGrade && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Color Grade
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.colorGrade}
                    </span>
                  </div>
                )}
                {visibility.showOrigin && gemstone.origin && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-light/30">
                    <span className="text-xs font-medium text-gray-warm uppercase tracking-wider">
                      Origin
                    </span>
                    <span className="text-sm font-medium text-charcoal">
                      {gemstone.origin}
                    </span>
                  </div>
                )}
              </div>

              {visibility.showCertificate && gemstone.certificateUrl && (
                <div className="p-5 bg-cream/50 border border-gold/20 rounded-lg border-l-4 border-l-gold">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gold/10 border border-gold/30 rounded-lg flex items-center justify-center text-gold">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect x="6" y="4" width="12" height="16" rx="1" />
                        <path d="M10 8H14M10 12H14" />
                        <circle cx="18" cy="18" r="4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-charcoal mb-0.5">
                        Certification
                      </div>
                      <div className="text-xs font-mono text-gray-warm">
                        Certificate Available
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowCertificate(true)}
                    className="w-full h-11 bg-gold text-white font-medium text-sm hover:bg-gold-dark rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <circle cx="9" cy="9" r="6" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                    View Certificate
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/[0.06] text-center">
        <p className="text-sm text-smoke">
          The Facet Studio powered by{" "}
          <span className="text-silver font-medium">FERA DxGITAL</span>
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
                <h3 className="text-base md:text-lg font-serif font-semibold text-charcoal">
                  Certificate
                </h3>
                <p className="text-xs md:text-sm text-gray-warm">
                  Gemstone Certificate
                </p>
              </div>
              <button
                onClick={() => setShowCertificate(false)}
                className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-lg active:bg-cream hover:bg-cream transition-all text-gray-warm hover:text-charcoal touch-manipulation"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M6 6L14 14M14 6L6 14" />
                </svg>
              </button>
            </div>
            <div className="p-3 md:p-6">
              {gemstone.certificateType === "pdf" ? (
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
