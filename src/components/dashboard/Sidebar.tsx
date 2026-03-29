"use client";

import { cn } from "@/lib/utils";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({
  activePage,
  onNavigate,
  onLogout,
}: SidebarProps) {
  const navItems = [
    {
      id: "add-new",
      label: "Add New",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="10" cy="10" r="7" />
          <path d="M10 7V13M7 10H13" />
        </svg>
      ),
    },
    {
      id: "orders",
      label: "Orders",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="14" height="14" rx="2" />
          <path d="M6 7H14M6 10H14M6 13H10" />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="10" cy="10" r="3" />
          <path d="M10 2.5V4.5M10 15.5V17.5M2.5 10H4.5M15.5 10H17.5M4.6 4.6L6 6M14 14L15.4 15.4M4.6 15.4L6 14M14 6L15.4 4.6" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="fixed left-0 top-0 w-[280px] h-screen bg-white border-r border-gray-light/50 flex flex-col z-50 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-light/50">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="The Facet Studio"
            width="32"
            height="32"
            className="object-contain"
          />
          <span className="text-charcoal font-serif font-semibold text-lg tracking-wide">
            The Facet Studio
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-sm font-medium transition-all duration-200",
              activePage === item.id
                ? "bg-gold text-white shadow-md"
                : "text-charcoal hover:bg-cream hover:text-gold",
            )}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-light/50">
        <button
          onClick={onLogout}
          className="w-full h-11 rounded-lg border border-gray-light text-charcoal text-sm font-medium hover:bg-cream transition-all"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
