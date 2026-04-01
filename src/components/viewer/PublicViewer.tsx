"use client";

import { useState, useRef, useEffect } from "react";
import { Gemstone } from "@/types/gemstone";
import { optimizeCloudinaryUrl } from "@/lib/utils";

interface PublicViewerProps {
  gemstone: Gemstone;
}

// Toggle header style: "image" or "gradient"
const HEADER_STYLE = "gradient";

export default function PublicViewer({ gemstone }: PublicViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHintModal, setShowHintModal] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dragStartX = useRef(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageCache = useRef<HTMLImageElement[]>([]);
  const animationFrame = useRef<number>();
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFrameTimeRef = useRef(0);
  const frameIntervalRef = useRef(25); // milliseconds between frames - much faster for smooth playback
  const currentFrameRef = useRef(0); // Track frame without state batching
  const dragOccurredRef = useRef(false); // Track if actual drag occurred
  const dragThresholdRef = useRef(18); // Min 18px movement to register as drag (not a tap)

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
  }, [isPlaying, gemstone.frames, currentFrame]);

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
    const threshold = dragThresholdRef.current;

    // Only treat as drag if movement exceeds threshold
    const absoluteDelta = Math.abs(delta);
    if (absoluteDelta >= threshold && !dragOccurredRef.current) {
      dragOccurredRef.current = true; // Mark that a real drag started
      setIsPlaying(false); // Pause immediately when drag starts
    }

    // Only update rotation if drag has occurred
    if (dragOccurredRef.current) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (drag right = rotate right)
        const frameDelta = Math.floor(delta / 3); // sensitivity: 3 pixels per frame (desktop)
        const newFrame =
          (currentFrameRef.current - frameDelta + gemstone.frames.length) %
          gemstone.frames.length;
        currentFrameRef.current = newFrame;
        setCurrentFrame(newFrame);
        dragStartX.current = e.clientX;
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false);
    // OnClick handler will take care of pause/play toggle
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
    const threshold = dragThresholdRef.current;

    // Only treat as drag if movement exceeds threshold
    const absoluteDelta = Math.abs(delta);
    if (absoluteDelta >= threshold && !dragOccurredRef.current) {
      dragOccurredRef.current = true; // Mark that a real drag started
      setIsPlaying(false); // Pause immediately when drag starts
    }

    // Only update rotation if drag has occurred
    if (dragOccurredRef.current) {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      animationFrame.current = requestAnimationFrame(() => {
        // Invert the direction for natural rotation (swipe right = rotate right)
        const frameDelta = Math.floor(delta / 2); // sensitivity: 2 pixels per frame (very responsive)
        const newFrame =
          (currentFrameRef.current - frameDelta + gemstone.frames.length) %
          gemstone.frames.length;
        currentFrameRef.current = newFrame;
        setCurrentFrame(newFrame);
        dragStartX.current = e.touches[0].clientX;
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    // OnClick handler will take care of pause/play toggle
  };

  const handleTouchCancel = () => {
    setIsDragging(false);
    // Don't toggle on cancel, just stop dragging
  };

  const handleViewerClick = () => {
    // Simple onClick handler - only fires if no drag occurred
    setIsPlaying((p) => !p);
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

  // Preload first image immediately, then preload rest in background
  useEffect(() => {
    if (!gemstone.frames || gemstone.frames.length === 0) return;

    const loadImages = async () => {
      // PRIORITY: Load first frame immediately
      try {
        const firstFrameUrl = optimizeCloudinaryUrl(gemstone.frames[0]);
        const firstImg = await new Promise<HTMLImageElement>(
          (resolve, reject) => {
            const img = new Image();
            img.src = firstFrameUrl;
            img.onload = () => resolve(img);
            img.onerror = reject;
          },
        );

        imageCache.current[0] = firstImg;
        setImagesLoaded(true); // Mark ready immediately after first frame
      } catch (error) {
        console.error("Error loading first frame:", error);
        setImagesLoaded(true); // Still show even if first frame fails
      }

      // BACKGROUND: Load remaining frames without blocking
      if (gemstone.frames.length > 1) {
        const remainingPromises = gemstone.frames.slice(1).map((src, index) => {
          return new Promise<{ img: HTMLImageElement; index: number }>(
            (resolve) => {
              const img = new Image();
              img.src = optimizeCloudinaryUrl(src);
              img.onload = () => resolve({ img, index: index + 1 });
              img.onerror = () => resolve({ img, index: index + 1 }); // Don't fail on individual frames
            },
          );
        });

        try {
          const loadedImages = await Promise.all(remainingPromises);
          loadedImages.forEach(({ img, index }) => {
            imageCache.current[index] = img;
          });
        } catch (error) {
          console.warn("Some frames failed to preload:", error);
        }
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
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-8 md:py-5"
        style={{
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><defs><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="6" seed="1" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter></defs><rect width="200" height="200" fill="%23000000" filter="url(%23noise)" opacity="0.25"/></svg>'), linear-gradient(90deg, #06050a 0%, #34262d 12%, #83070c 28%, #e73e3d 52%, #f16761 76%, #811621 100%)`,
          backgroundBlendMode: "overlay",
          backgroundSize: "100% 100%, 100% 100%",
          backgroundAttachment: "fixed",
          boxShadow: "0 12px 24px rgba(74, 4, 4, 0.2)",
        }}
      >
        <style>{`
          @font-face {
            font-family: 'Kind Avenue';
            src: url('/fonts/Kind-Avenue.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `}</style>
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          {/* Logo/Brand */}
          <a
            href="/"
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span
              style={{
                fontFamily: "'Kind Avenue', sans-serif",
                fontSize: "28px",
                fontWeight: "400",
                color: "white",
                letterSpacing: "-1px",
                textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              }}
            >
              The Facet Studio
            </span>
          </a>

          {/* Navigation */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Desktop Navigation */}
            <a
              href="/"
              className="hidden md:flex h-10 px-5 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all border border-white/20"
            >
              Home
            </a>
            <a
              href="mailto:farhannavufal@gmail.com"
              className="hidden md:flex h-10 px-5 items-center justify-center rounded-lg bg-gold hover:bg-gold/90 text-white font-medium transition-all shadow-md"
            >
              Contact Us
            </a>

            {/* Mobile Menu Icon */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all border border-white/20"
              aria-label="Toggle menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setShowMobileMenu(false)}
          />
          {/* Menu */}
          <div
            className="fixed right-0 z-40 md:hidden overflow-hidden"
            style={{
              top: "65px",
              height: "calc(100vh - 60px)",
              width: "min(100%, 320px)",
              animation: "slideInRight 0.3s ease-out",
              backdropFilter: "blur(30px)",
            }}
          >
            <style>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(100%);
                  opacity: 0;
                }
                to {
                  transform: translateX(0);
                  opacity: 1;
                }
              }
            `}</style>
            <div
              className="h-full border-l border-white/20 shadow-2xl flex flex-col"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-black/40">
                <h3
                  className="text-base font-serif font-semibold text-white"
                  style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)" }}
                >
                  Menu
                </h3>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-white transition-all"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 px-6 py-8 space-y-6 overflow-y-auto flex flex-col bg-black/20">
                <a
                  href="/"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-lg font-medium text-white hover:text-white/80 transition-colors border-b border-transparent hover:border-white/30 pb-1"
                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)" }}
                >
                  Home
                </a>
                <a
                  href="mailto:farhannavufal@gmail.com"
                  onClick={() => setShowMobileMenu(false)}
                  className="text-lg font-medium text-white hover:text-white/80 transition-colors border-b border-transparent hover:border-white/30 pb-1"
                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.5)" }}
                >
                  Contact Us
                </a>
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 px-6 py-6 bg-black/40 flex flex-col items-center gap-4">
                <p
                  className="text-xs text-white/80 text-center"
                  style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
                >
                  The Facet Studio
                </p>
                <div className="flex gap-4 justify-center">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 text-white/70 hover:text-white transition-colors"
                    style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.205 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z" />
                    </svg>
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-6 h-6 text-white/70 hover:text-white transition-colors"
                    style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.5)" }}
                  >
                    <svg fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 md:px-8 pt-24 md:pt-28 pb-8 md:pb-16">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-[auto_420px] gap-4 md:gap-8 items-center justify-center mx-auto">
          {/* 360° Viewer */}
          <div className="relative w-full max-w-3xl mx-auto aspect-square">
            <div
              ref={viewerRef}
              onClick={handleViewerClick}
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
                    src={optimizeCloudinaryUrl(gemstone.frames[currentFrame])}
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

            {/* Logo overlay (Tier A - Premium) */}
            {gemstone.tier === "A" && gemstone.logoUrl && (
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

          {/* Floating Info Bar for Tier A - Premium Version */}
          {gemstone.tier === "A" && gemstone.title && (
            <div
              className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-6 w-full lg:w-auto"
              style={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)" }}
            >
              <div>
                <h2 className="text-lg md:text-xl font-serif text-charcoal tracking-tight mb-3">
                  {gemstone.title}
                </h2>
                {(gemstone.weight || gemstone.origin) && (
                  <div className="flex flex-col gap-4">
                    {gemstone.weight && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-semibold text-gold">
                          {gemstone.weight}
                        </span>
                        <span className="text-sm text-gray-warm font-medium">
                          carats
                        </span>
                      </div>
                    )}
                    {(gemstone.origin || gemstone.treatment) && (
                      <div className="grid grid-cols-2 gap-4">
                        {gemstone.origin && (
                          <div>
                            <p className="text-xs text-gray-warm uppercase tracking-wider font-medium">
                              Origin
                            </p>
                            <p className="text-sm text-charcoal font-medium">
                              {gemstone.origin}
                            </p>
                          </div>
                        )}
                        {gemstone.treatment && (
                          <div>
                            <p className="text-xs text-gray-warm uppercase tracking-wider font-medium">
                              Identification
                            </p>
                            <p className="text-sm text-charcoal font-medium">
                              {gemstone.treatment}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {gemstone.certificateUrl && (
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="col-span-2 mt-4 h-11 bg-gold text-white font-medium text-sm hover:bg-gold-dark rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
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
                    )}
                  </div>
                )}
                {gemstone.description && (
                  <div className="mt-4 pt-4 border-t border-gray-light/50">
                    <p className="text-sm text-charcoal leading-relaxed">
                      {gemstone.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-light/50">
                <span className="text-xs text-gray-warm font-mono tracking-wide block">
                  Gemstone #{gemstone.id}
                </span>
              </div>
            </div>
          )}

          {/* Information Panel - Only for Tier B (Standard) */}
          {gemstone.tier === "B" && gemstone.title && (
            <div
              className="bg-white rounded-xl md:rounded-2xl p-5 md:p-8 space-y-4 md:space-y-6 w-full lg:w-auto"
              style={{ boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12)" }}
            >
              <div>
                <h2 className="text-lg md:text-xl font-serif text-charcoal tracking-tight mb-3">
                  {gemstone.title}
                </h2>
                {(gemstone.weight || gemstone.origin) && (
                  <div className="flex flex-col gap-4">
                    {gemstone.weight && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-serif font-semibold text-gold">
                          {gemstone.weight}
                        </span>
                        <span className="text-sm text-gray-warm font-medium">
                          carats
                        </span>
                      </div>
                    )}
                    {gemstone.origin && (
                      <div>
                        <p className="text-xs text-gray-warm uppercase tracking-wider font-medium">
                          Origin
                        </p>
                        <p className="text-sm text-charcoal font-medium">
                          {gemstone.origin}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {gemstone.description && (
                  <div className="mt-4 pt-4 border-t border-gray-light/50">
                    <p className="text-sm text-charcoal leading-relaxed">
                      {gemstone.description}
                    </p>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-gray-light/50">
                <span className="text-xs text-gray-warm font-mono tracking-wide block">
                  Gemstone #{gemstone.id}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-light/20 border-t border-gray-light/30">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Company Info */}
            <div>
              <h3 className="font-serif text-lg text-charcoal mb-4">
                The Facet Studio
              </h3>
              <p className="text-sm text-gray-warm leading-relaxed mb-4">
                Premium 360° gemstone viewer showcasing luxury jewelry with
                precision and elegance.
              </p>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-medium text-charcoal text-sm mb-4 uppercase tracking-wider">
                Contact
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gold flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-gray-warm">
                    294, Bope Road, Piyadigama, Gintota
                    <br />
                    Galle, Sri Lanka
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gold flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <a
                    href="tel:+94776386902"
                    className="text-gray-warm hover:text-gold transition-colors"
                  >
                    +94 (77) 638 6902
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-gold flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <a
                    href="mailto:farhannavufal@gmail.com"
                    className="text-gray-warm hover:text-gold transition-colors"
                  >
                    farhannavufal@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h4 className="font-medium text-charcoal text-sm mb-4 uppercase tracking-wider">
                Follow Us
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all"
                  title="Instagram"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.28-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-gold/10 border border-gold/30 flex items-center justify-center text-gold hover:bg-gold hover:text-white transition-all"
                  title="Facebook"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-light/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-warm">
                © 2025 The Facet Studio. All rights reserved.
              </p>
              <p className="text-xs text-gray-warm">
                Powered by{" "}
                <span className="font-medium text-charcoal">FERA DxGITAL</span>
              </p>
            </div>
          </div>
        </div>
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
