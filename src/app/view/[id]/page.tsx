'use client';

import { useParams } from 'next/navigation';
import PublicViewer from '@/components/viewer/PublicViewer';
import { useGemstoneStore } from '@/store/gemstoneStore';

export default function ViewerPage() {
  const params = useParams();
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const getCertificate = useGemstoneStore((state) => state.getCertificateByGemstoneId);
  
  const gemstone = gemstones.find((g) => g.id === params.id);
  const certificate = gemstone ? getCertificate(gemstone.id) : undefined;

  if (!gemstone) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-white mb-4">Gemstone Not Found</h1>
          <p className="text-smoke">The requested gemstone could not be found.</p>
        </div>
      </div>
    );
  }

  return <PublicViewer gemstone={gemstone} certificate={certificate} />;
}
