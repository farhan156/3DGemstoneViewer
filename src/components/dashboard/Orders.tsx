'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useGemstoneStore } from '@/store/gemstoneStore';
import EditOrder from './EditOrder';
import type { Gemstone } from '@/types/gemstone';

export default function Orders() {
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const deleteGemstone = useGemstoneStore((state) => state.deleteGemstone);
  const fetchGemstones = useGemstoneStore((state) => state.fetchGemstones);
  const isLoading = useGemstoneStore((state) => state.isLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState<Gemstone | null>(null);

  useEffect(() => {
    fetchGemstones();
  }, [fetchGemstones]);

  const filtered = gemstones.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (g.orderNumber || '').toLowerCase().includes(q) ||
      g.customerContact.toLowerCase().includes(q) ||
      g.customerName.toLowerCase().includes(q) ||
      (g.title || '').toLowerCase().includes(q)
    );
  });

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(window.location.origin + '/view/' + id);
    toast.success('Link copied!');
  };

  const sendWhatsApp = (phone: string, id: string) => {
    const cleaned = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Hello! Your 360° jewellery view is ready. View it here: ${window.location.origin}/view/${id}`
    );
    window.open(`https://wa.me/${cleaned}?text=${message}`, '_blank');
  };

  const handleDelete = (order: Gemstone) => {
    if (
      confirm(
        `Delete order ${order.orderNumber || order.id} for "${order.customerName}"? This cannot be undone.`
      )
    ) {
      deleteGemstone(order.id);
      toast.success('Order deleted');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-gray-light/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl text-charcoal mb-1 tracking-tight">Orders</h1>
          <p className="text-gray-warm text-sm">
            {filtered.length} {filtered.length === 1 ? 'order' : 'orders'} found
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order no. or phone…"
            className="h-10 pl-10 pr-4 w-80 bg-white border border-gray-light text-charcoal text-sm rounded-lg focus:border-gold focus:outline-none"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-warm"
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            stroke="currentColor" strokeWidth="1.5"
          >
            <circle cx="7" cy="7" r="4" />
            <path d="M11 11L14 14" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-warm hover:text-charcoal transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 3L11 11M11 3L3 11" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-cream flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-gray-warm" stroke="currentColor" strokeWidth="1.5">
              <rect x="6" y="6" width="20" height="20" rx="2" />
              <path d="M10 12H22M10 17H18" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-charcoal mb-2">No orders found</h3>
          <p className="text-gray-warm text-sm">
            {searchQuery ? 'Try a different search term' : 'Add your first order to get started'}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white border border-gray-light/50 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[100px_1fr_140px_80px_80px_120px] gap-4 px-5 py-3 bg-cream/50 border-b border-gray-light/50 text-xs font-medium text-gray-warm uppercase tracking-wider">
            <span>Order #</span>
            <span>Customer</span>
            <span>Phone</span>
            <span>Tier</span>
            <span>Frames</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-light/40">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[100px_1fr_140px_80px_80px_120px] gap-4 px-5 py-4 hover:bg-cream/20 transition-colors items-center"
              >
                {/* Order # */}
                <span className="text-xs font-mono font-semibold text-charcoal tracking-wide truncate">
                  {order.orderNumber || order.id.slice(-8)}
                </span>

                {/* Customer */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal truncate">{order.customerName}</p>
                  {order.title && (
                    <p className="text-xs text-gray-warm truncate mt-0.5">{order.title}</p>
                  )}
                </div>

                {/* Phone */}
                <span className="text-sm text-charcoal font-mono truncate">{order.customerContact}</span>

                {/* Tier */}
                <span className={`inline-flex items-center justify-center w-16 h-6 rounded-full text-xs font-semibold ${
                  order.tier === 'B'
                    ? 'bg-gold/15 text-gold border border-gold/30'
                    : 'bg-cream text-charcoal border border-gray-light'
                }`}>
                  {order.tier ? `Tier ${order.tier}` : '—'}
                </span>

                {/* Frames count */}
                <span className="text-sm text-charcoal text-center">{order.frames?.length ?? 0}</span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  {/* View */}
                  <Link
                    href={`/view/${order.id}`}
                    target="_blank"
                    title="View"
                    className="w-8 h-8 rounded-lg border border-gray-light hover:bg-gold hover:border-gold hover:text-white text-gray-warm flex items-center justify-center transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="7" cy="7" r="3" />
                      <path d="M1 7C1 7 3 2 7 2s6 5 6 5-2 5-6 5-6-5-6-5z" />
                    </svg>
                  </Link>

                  {/* Copy link */}
                  <button
                    onClick={() => copyLink(order.id)}
                    title="Copy link"
                    className="w-8 h-8 rounded-lg border border-gray-light hover:bg-cream text-gray-warm hover:text-charcoal flex items-center justify-center transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 5H11C11.5523 5 12 5.44772 12 6V12C12 12.5523 11.5523 13 11 13H5C4.44772 13 4 12.5523 4 12V10" />
                      <rect x="2" y="2" width="7" height="7" rx="1" />
                    </svg>
                  </button>

                  {/* WhatsApp */}
                  <button
                    onClick={() => sendWhatsApp(order.customerContact, order.id)}
                    title="Send via WhatsApp"
                    className="w-8 h-8 rounded-lg border border-gray-light hover:bg-[#25D366] hover:border-[#25D366] hover:text-white text-gray-warm flex items-center justify-center transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => setEditingOrder(order)}
                    title="Edit"
                    className="w-8 h-8 rounded-lg border border-gray-light hover:bg-cream text-gray-warm hover:text-charcoal flex items-center justify-center transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(order)}
                    title="Delete"
                    className="w-8 h-8 rounded-lg border border-ruby/30 hover:bg-ruby/10 text-ruby flex items-center justify-center transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 3.5H12M4.5 3.5V2.5C4.5 2.22386 4.72386 2 5 2H9C9.27614 2 9.5 2.22386 9.5 2.5V3.5M5.5 6V10M8.5 6V10M3.5 3.5L4 11.5C4 11.7761 4.22386 12 4.5 12H9.5C9.77614 12 10 11.7761 10 11.5L10.5 3.5" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingOrder && (
        <EditOrder order={editingOrder} onClose={() => setEditingOrder(null)} />
      )}
    </div>
  );
}
