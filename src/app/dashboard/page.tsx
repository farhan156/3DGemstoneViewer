"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import AddNewOrder from "@/components/dashboard/AddNewOrder";
import Orders from "@/components/dashboard/Orders";
import Settings from "@/components/dashboard/Settings";
import { useAuthStore } from "@/store/authStore";
import type { Gemstone } from "@/types/gemstone";

export default function DashboardPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState("add-new");
  const [editingOrder, setEditingOrder] = useState<Gemstone | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isAuthLoading, router, user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  const renderPage = () => {
    switch (activePage) {
      case "add-new":
        return <AddNewOrder onComplete={() => setActivePage("orders")} />;
      case "edit-order":
        return (
          <AddNewOrder
            initialDraft={editingOrder || undefined}
            onComplete={() => {
              setEditingOrder(null);
              setActivePage("orders");
            }}
          />
        );
      case "orders":
        return (
          <Orders
            onEditOrder={(order) => {
              setEditingOrder(order);
              setActivePage("edit-order");
            }}
          />
        );
      case "settings":
        return <Settings />;
      default:
        return <AddNewOrder onComplete={() => setActivePage("orders")} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-pearl">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        onLogout={handleLogout}
      />
      <main className="flex-1 ml-[280px] p-8 lg:p-12 animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}
