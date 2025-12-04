'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import UploadGemstone from '@/components/dashboard/UploadGemstone';
import Gallery from '@/components/dashboard/Gallery';

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('upload');

  const renderPage = () => {
    switch (activePage) {
      case 'upload':
        return <UploadGemstone onComplete={() => setActivePage('gallery')} />;
      case 'gallery':
        return <Gallery />;
      default:
        return <UploadGemstone onComplete={() => setActivePage('gallery')} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-pearl">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="flex-1 ml-[280px] p-8 lg:p-12 animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}
