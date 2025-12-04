'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PublicViewer from '@/components/viewer/PublicViewer';
import { Gemstone } from '@/types/gemstone';
import { useGemstoneStore } from '@/store/gemstoneStore';

export default function ViewerPage() {
  const params = useParams();
  const [gemstone, setGemstone] = useState<Gemstone | null>(null);
  const [loading, setLoading] = useState(true);
  const getGemstoneById = useGemstoneStore((state) => state.getGemstoneById);

  useEffect(() => {
    const fetchGemstone = async () => {
      try {
        const data = await getGemstoneById(params.id as string);
        setGemstone(data);
      } catch (error) {
        console.error('Error fetching gemstone:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGemstone();
  }, [params.id, getGemstoneById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-charcoal">Loading gemstone...</p>
        </div>
      </div>
    );
  }

  if (!gemstone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-charcoal mb-4">Gemstone Not Found</h1>
          <p className="text-gray-warm">The requested gemstone could not be found.</p>
        </div>
      </div>
    );
  }

  return <PublicViewer gemstone={gemstone} />;
}
