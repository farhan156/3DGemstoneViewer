'use client';

import { cn } from '@/lib/utils';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const navItems = [
    {
      id: 'upload',
      label: 'Upload Gemstone',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 14V6M10 6L7 9M10 6L13 9"/>
          <rect x="4" y="4" width="12" height="12" rx="1"/>
        </svg>
      ),
    },
    {
      id: 'gallery',
      label: 'All Gemstones',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="14" height="14" rx="2"/>
          <path d="M3 13L7 9L10 12L17 5"/>
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[280px] h-screen bg-white border-r border-gray-light/50 flex flex-col z-50 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-light/50">
        <div className="flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gold">
            <path d="M16 2L6 10L8 24L16 30L24 24L26 10L16 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="bevel" fill="currentColor" fillOpacity="0.1"/>
            <path d="M16 2V30M6 10H26M8 24H24" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
          </svg>
          <span className="text-charcoal font-serif font-semibold text-lg tracking-wide">GEMSTONE VIEWER</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-200',
              activePage === item.id
                ? 'bg-gold text-white shadow-md'
                : 'text-charcoal hover:bg-cream hover:text-gold'
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
