'use client';

import { useGemstoneStore } from '@/store/gemstoneStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Gallery() {
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const deleteGemstone = useGemstoneStore((state) => state.deleteGemstone);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGemstones = gemstones.filter((gem) => {
    if (statusFilter !== 'all' && gem.status !== statusFilter) return false;
    if (typeFilter !== 'all' && gem.type !== typeFilter) return false;
    
    // Search across multiple fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = gem.name?.toLowerCase().includes(query);
      const matchesCustomer = gem.customerName?.toLowerCase().includes(query);
      const matchesContact = gem.customerContact?.toLowerCase().includes(query);
      const matchesId = gem.id.toLowerCase().includes(query);
      
      if (!matchesName && !matchesCustomer && !matchesContact && !matchesId) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="pb-6 border-b border-gray-light/50 flex justify-between items-start">
        <div>
          <h1 className="font-serif text-4xl text-charcoal mb-2 tracking-tight">All Gemstones</h1>
          <p className="text-gray-warm text-sm">
            {filteredGemstones.length} {filteredGemstones.length === 1 ? 'gemstone' : 'gemstones'} in collection
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, customer, or ID..."
              className="h-10 pl-10 pr-4 w-80 bg-white border border-gray-light text-charcoal text-sm rounded-lg focus:border-gold focus:outline-none"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-warm" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="7" cy="7" r="4" />
              <path d="M11 11L14 14" />
            </svg>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-4 bg-white border border-gray-light text-charcoal text-sm rounded-lg focus:border-gold focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-4 bg-white border border-gray-light text-charcoal text-sm rounded-lg focus:border-gold focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="ruby">Ruby</option>
            <option value="sapphire">Sapphire</option>
            <option value="emerald">Emerald</option>
            <option value="diamond">Diamond</option>
          </select>
        </div>
      </header>

      {filteredGemstones.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gray-warm">
              <path d="M16 2L6 10L8 24L16 30L24 24L26 10L16 2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-charcoal mb-2">No gemstones found</h3>
          <p className="text-gray-warm text-sm">Upload your first gemstone to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredGemstones.map((gem) => (
            <div
              key={gem.id}
              className="bg-white border border-gray-light/50 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className="h-64 bg-cream flex items-center justify-center relative overflow-hidden"
                style={{
                  background: `radial-gradient(circle at center, ${
                    gem.type === 'ruby'
                      ? 'rgba(196,30,58,0.08)'
                      : gem.type === 'sapphire'
                      ? 'rgba(15,82,186,0.08)'
                      : gem.type === 'emerald'
                      ? 'rgba(80,200,120,0.08)'
                      : 'rgba(212,175,55,0.08)'
                  }, #F5F3EF)`,
                }}
              >
                {gem.frames && gem.frames.length > 0 ? (
                  <img src={gem.frames[0]} alt={gem.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-32 h-32 relative">
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 to-transparent border-2 border-gold/30 transform rotate-45 relative rounded-lg">
                      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-gold/15 to-transparent border border-gold/20 rounded" />
                    </div>
                  </div>
                )}
                <span
                  className={cn(
                    'absolute top-3 right-3 px-3 py-1 text-xs font-medium uppercase tracking-wide rounded-full',
                    'backdrop-blur-sm',
                    gem.status === 'completed'
                      ? 'bg-emerald/10 text-emerald border border-emerald/20'
                      : gem.status === 'processing'
                      ? 'bg-topaz/10 text-topaz border border-topaz/20'
                      : 'bg-gray-warm/10 text-gray-warm border border-gray-warm/20'
                  )}
                >
                  {gem.status}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl text-charcoal mb-1">{gem.name || 'Unnamed Gemstone'}</h3>
                <div className="text-sm text-charcoal mb-1">
                  <span className="text-gray-warm">Customer:</span> <span className="font-medium">{gem.customerName}</span>
                </div>
                <div className="text-sm text-gray-warm mb-1">
                  {gem.weight ? `${gem.weight} ct` : 'Weight N/A'}
                  {gem.cut && ` · ${gem.cut}`}
                  {gem.origin && ` · ${gem.origin}`}
                </div>
                <div className="text-xs text-gray-cool font-mono tracking-wide mb-5">ID: {gem.id}</div>
                <div className="flex gap-2">
                  {gem.status === 'completed' && gem.shareableLink ? (
                    <>
                      <Link
                        href={`/view/${gem.id}`}
                        className="flex-1 h-9 px-4 flex items-center justify-center gap-2 text-sm font-medium bg-gold text-white rounded-lg hover:bg-gold-dark transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="8" cy="8" r="5" />
                          <circle cx="8" cy="8" r="2" />
                        </svg>
                        View 360°
                      </Link>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + '/view/' + gem.id);
                          toast.success('Link copied to clipboard!');
                        }}
                        title="Copy shareable link"
                        className="w-9 h-9 border border-gray-light hover:bg-cream text-gray-warm hover:text-gold rounded-lg flex items-center justify-center transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M10 6H12C12.5523 6 13 6.44772 13 7V13C13 13.5523 12.5523 14 12 14H6C5.44772 14 5 13.5523 5 13V11" />
                          <rect x="3" y="2" width="7" height="7" rx="1" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="flex-1 h-9 px-4 flex items-center justify-center gap-2 text-sm font-medium bg-gray-light/30 text-gray-warm rounded-lg cursor-not-allowed"
                    >
                      Processing...
                    </button>
                  )}
                  {gem.certificateId && (
                    <button 
                      title="View certificate"
                      className="w-9 h-9 border border-gray-light hover:bg-cream transition-all text-gray-warm hover:text-gold rounded-lg flex items-center justify-center"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="4" y="3" width="8" height="10" rx="1" />
                        <path d="M6 6H10M6 8H10" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${gem.name || 'this gemstone'}"? This action cannot be undone.`)) {
                        deleteGemstone(gem.id);
                        toast.success('Gemstone deleted successfully');
                      }
                    }}
                    title="Delete gemstone"
                    className="w-9 h-9 border border-ruby/30 hover:bg-ruby/10 text-ruby hover:text-ruby rounded-lg flex items-center justify-center transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
