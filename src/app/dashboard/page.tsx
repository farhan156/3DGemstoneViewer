'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import AddNewOrder from '@/components/dashboard/AddNewOrder';
import Orders from '@/components/dashboard/Orders';

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('add-new');

  const renderPage = () => {
    switch (activePage) {
      case 'add-new':
        return <AddNewOrder onComplete={() => setActivePage('orders')} />;
      case 'orders':
        return <Orders />;
      default:
        return <AddNewOrder onComplete={() => setActivePage('orders')} />;
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
