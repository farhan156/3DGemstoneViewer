'use client';

import { Gemstone, Certificate } from '@/types/gemstone';

interface PublicViewerProps {
  gemstone: Gemstone;
  certificate?: Certificate;
}

export default function PublicViewer({ gemstone, certificate }: PublicViewerProps) {
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
      <main className="flex-1 flex items-center justify-center px-8 pt-28 pb-16">
        <div className="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-center">
          {/* 360° Viewer */}
          <div className="relative max-w-3xl mx-auto w-full aspect-square">
            <div className="w-full h-full bg-cream border border-gray-light/50 rounded-xl flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg overflow-hidden">
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
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/95 backdrop-blur-md border border-gray-light/50 rounded-lg shadow-lg">
              <button className="w-10 h-10 border border-gray-light hover:bg-cream text-charcoal transition-all flex items-center justify-center rounded">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M11 5L8 9L11 13" />
                  <circle cx="9" cy="9" r="7" />
                </svg>
              </button>
              <button className="w-10 h-10 border border-gray-light hover:bg-cream text-charcoal transition-all flex items-center justify-center rounded">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="9" r="7" />
                  <circle cx="9" cy="9" r="2" />
                </svg>
              </button>
              <button className="w-10 h-10 border border-gray-light hover:bg-cream text-charcoal transition-all flex items-center justify-center rounded">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 5L10 9L7 13" />
                  <circle cx="9" cy="9" r="7" />
                </svg>
              </button>
            </div>

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs text-gray-warm bg-white/90 px-5 py-2 backdrop-blur-sm border border-gray-light/50 rounded-full shadow-sm">
              Drag to rotate · Scroll to zoom
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-white border border-gray-light/50 rounded-xl p-8 space-y-6 shadow-lg">
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

            {visibility.showCertificate && certificate && (
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
                    <div className="text-sm font-medium text-charcoal mb-0.5">{certificate.issuer} Certification</div>
                    <div className="text-xs font-mono text-gray-warm">Certificate #{certificate.certificateNumber}</div>
                  </div>
                </div>
                <button className="w-full h-11 bg-gold text-white font-medium text-sm hover:bg-gold-dark rounded-lg transition-all flex items-center justify-center gap-2 shadow-md">
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
    </div>
  );
}
