'use client';

import { Gemstone, Certificate } from '@/types/gemstone';

interface PublicViewerProps {
  gemstone: Gemstone;
  certificate?: Certificate;
}

export default function PublicViewer({ gemstone, certificate }: PublicViewerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-8 bg-gradient-to-b from-obsidian-dark/95 to-transparent backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="text-silver">
            <path
              d="M16 2L6 10L8 24L16 30L24 24L26 10L16 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="bevel"
            />
            <path d="M16 2V30M6 10H26M8 24H24" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
          <span className="text-white font-medium text-sm tracking-wide">GEMSTONE FORGE</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-8 pt-32 pb-16">
        <div className="max-w-screen-2xl w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-center">
          {/* 360° Viewer */}
          <div className="relative max-w-3xl mx-auto w-full aspect-square">
            <div className="w-full h-full bg-carbon border border-white/[0.04] flex items-center justify-center cursor-grab active:cursor-grabbing">
              <div
                className="w-96 h-96 relative animate-float"
                style={{
                  background: `radial-gradient(circle at center, ${
                    gemstone.type === 'ruby'
                      ? 'rgba(155,28,49,0.12)'
                      : gemstone.type === 'sapphire'
                      ? 'rgba(15,76,129,0.12)'
                      : 'rgba(25,104,68,0.12)'
                  }, transparent 70%)`,
                }}
              >
                <div className="w-full h-full transform rotate-45">
                  <div className="w-full h-full bg-gradient-to-br from-white/20 via-transparent to-transparent border-3 border-white/25 relative animate-gem-rotate">
                    <div className="absolute top-1/5 left-1/5 w-3/5 h-3/5 bg-gradient-to-br from-white/15 to-transparent border-2 border-white/20">
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/25 to-transparent border border-white/15" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 p-4 bg-obsidian/90 backdrop-blur-md border border-white/10">
              <button className="w-11 h-11 border border-white/15 hover:bg-white/[0.05] text-white transition-all flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 7L10 10L13 13" />
                  <circle cx="10" cy="10" r="7" />
                </svg>
              </button>
              <button className="w-11 h-11 border border-white/15 hover:bg-white/[0.05] text-white transition-all flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="10" cy="10" r="7" />
                  <circle cx="10" cy="10" r="2" />
                </svg>
              </button>
              <button className="w-11 h-11 border border-white/15 hover:bg-white/[0.05] text-white transition-all flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 7L10 10L7 13" />
                  <circle cx="10" cy="10" r="7" />
                </svg>
              </button>
            </div>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 text-sm text-smoke bg-obsidian/80 px-6 py-2 backdrop-blur-sm border border-white/[0.08]">
              Drag to rotate · Scroll to zoom
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-carbon border border-white/[0.06] p-8 space-y-8">
            <div className="pb-8 border-b border-white/[0.06]">
              <h1 className="font-serif text-5xl text-white mb-4 tracking-tight leading-tight">{gemstone.name}</h1>
              <p className="text-silver-soft text-[15px] mb-2">
                Natural Corundum · {gemstone.origin || 'Premium Origin'}
              </p>
              <p className="text-smoke text-xs font-mono tracking-wide">ID: {gemstone.id}</p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Weight', value: `${gemstone.weight} carats` },
                { label: 'Cut', value: gemstone.cut },
                { label: 'Clarity', value: gemstone.clarity || 'N/A' },
                { label: 'Color Grade', value: gemstone.colorGrade || 'N/A' },
                { label: 'Origin', value: gemstone.origin || 'N/A' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center pb-3 border-b border-white/[0.04]">
                  <span className="text-xs font-medium text-smoke uppercase tracking-wider">{item.label}</span>
                  <span className="text-[15px] text-white">{item.value}</span>
                </div>
              ))}
            </div>

            {certificate && (
              <div className="p-6 bg-obsidian border border-white/[0.06] border-l-2 border-l-gemstone-ruby">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gemstone-ruby/10 border border-gemstone-ruby/30 flex items-center justify-center text-gemstone-ruby/80">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="6" y="4" width="12" height="16" rx="1" />
                      <path d="M10 8H14M10 12H14" />
                      <circle cx="18" cy="18" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-0.5">{certificate.issuer} Certification</div>
                    <div className="text-xs font-mono text-smoke">Certificate #{certificate.certificateNumber}</div>
                  </div>
                </div>
                <button className="w-full h-12 bg-white text-obsidian font-medium text-sm hover:bg-silver transition-all flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="6" />
                    <circle cx="8" cy="8" r="2" />
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
