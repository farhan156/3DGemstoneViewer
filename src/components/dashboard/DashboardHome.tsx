'use client';

import { useGemstoneStore } from '@/store/gemstoneStore';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardHome() {
  const gemstones = useGemstoneStore((state) => state.gemstones);
  const getCertificate = useGemstoneStore((state) => state.getCertificateByGemstoneId);

  const stats = {
    totalGems: gemstones.length,
    modelsGenerated: gemstones.filter((g) => g.status === 'completed').length,
    certificatesAttached: gemstones.filter((g) => g.certificateId).length,
    activeLinks: gemstones.filter((g) => g.shareableLink).length,
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copied to clipboard!');
  };

  const quickActions = [
    {
      title: 'Upload Gemstone Images',
      description: 'Upload 360° rotation frames',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V8M12 8L9 11M12 8L15 11"/>
          <rect x="5" y="5" width="14" height="14"/>
        </svg>
      ),
    },
    {
      title: 'Upload Certificate',
      description: 'Attach certification documents',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="6" y="4" width="12" height="16"/>
          <path d="M10 8H14M10 12H14"/>
        </svg>
      ),
    },
    {
      title: 'Generate 360° Model',
      description: 'Create interactive viewer',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="8"/>
          <path d="M12 6V4M12 20V18"/>
        </svg>
      ),
    },
    {
      title: 'Copy Shareable Link',
      description: 'Share with customers',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 12H16M16 12L13 9M16 12L13 15"/>
          <circle cx="18" cy="12" r="2"/>
          <circle cx="6" cy="12" r="2"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="pb-8 border-b border-white/[0.06]">
        <h1 className="font-serif text-4xl text-white mb-2 tracking-tight">Dashboard</h1>
        <p className="text-smoke text-sm">Manage your gemstone collection and 360° models</p>
      </header>

      {/* Quick Actions */}
      <section>
        <h2 className="font-serif text-2xl text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="p-6 bg-carbon border border-white/[0.06] hover:bg-graphite hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-1 text-left group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <div className="w-12 h-12 bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4 text-white">
                {action.icon}
              </div>
              <h3 className="text-white font-medium mb-1">{action.title}</h3>
              <p className="text-smoke text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="p-6 bg-carbon border-l-2 border-white/20 border-t border-r border-b border-white/[0.06]">
            <div className="text-xs font-medium text-smoke uppercase tracking-wider mb-2">Total Gems Uploaded</div>
            <div className="font-serif text-5xl font-light text-white mb-2">{stats.totalGems}</div>
            <div className="text-sm text-silver">+12 this month</div>
          </div>
          <div className="p-6 bg-carbon border-l-2 border-white/20 border-t border-r border-b border-white/[0.06]">
            <div className="text-xs font-medium text-smoke uppercase tracking-wider mb-2">360° Models Generated</div>
            <div className="font-serif text-5xl font-light text-white mb-2">{stats.modelsGenerated}</div>
            <div className="text-sm text-silver">+8 this month</div>
          </div>
          <div className="p-6 bg-carbon border-l-2 border-white/20 border-t border-r border-b border-white/[0.06]">
            <div className="text-xs font-medium text-smoke uppercase tracking-wider mb-2">Certificates Attached</div>
            <div className="font-serif text-5xl font-light text-white mb-2">{stats.certificatesAttached}</div>
            <div className="text-sm text-smoke">92% completion</div>
          </div>
          <div className="p-6 bg-carbon border-l-2 border-white/20 border-t border-r border-b border-white/[0.06]">
            <div className="text-xs font-medium text-smoke uppercase tracking-wider mb-2">Active Shared Links</div>
            <div className="font-serif text-5xl font-light text-white mb-2">{stats.activeLinks}</div>
            <div className="text-sm text-silver">28 views today</div>
          </div>
        </div>
      </section>

      {/* Recent Gemstones Table */}
      <section>
        <h2 className="font-serif text-2xl text-white mb-6">Recent Gemstones</h2>
        <div className="bg-carbon border border-white/[0.06] overflow-x-auto">
          <table className="w-full">
            <thead className="bg-obsidian">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  Gemstone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  360° Model
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  Certificate
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-smoke uppercase tracking-wider border-b border-white/[0.06]">
                  Date
                </th>
                <th className="px-6 py-4 border-b border-white/[0.06]"></th>
              </tr>
            </thead>
            <tbody>
              {gemstones.slice(0, 5).map((gem) => {
                const cert = getCertificate(gem.id);
                return (
                  <tr key={gem.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      <div className={`w-14 h-14 bg-slate border border-white/10 flex items-center justify-center relative overflow-hidden`}
                        style={{
                          background: `radial-gradient(circle, ${gem.type === 'ruby' ? 'rgba(155,28,49,0.15)' : gem.type === 'sapphire' ? 'rgba(15,76,129,0.15)' : 'rgba(25,104,68,0.15)'}, #2f2f2f)`
                        }}>
                        <div className="w-6 h-6 bg-gradient-to-br from-white/10 to-transparent border border-white/15 transform rotate-45" />
                      </div>
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      <div className="font-medium text-white">{gem.name}</div>
                      <div className="text-sm text-smoke">{gem.weight} ct · {gem.cut}</div>
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      <span className={`inline-block px-3 py-1 text-xs font-medium uppercase tracking-wide border ${
                        gem.status === 'completed' 
                          ? 'text-white bg-white/[0.08] border-white/20' 
                          : 'text-silver bg-silver/[0.05] border-silver/15'
                      }`}>
                        {gem.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      <button className="w-9 h-9 border border-white/10 hover:bg-white/[0.05] hover:border-white/15 transition-all text-silver-soft hover:text-white flex items-center justify-center"
                        disabled={gem.status !== 'completed'}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="9" cy="9" r="6"/>
                          <circle cx="9" cy="9" r="2"/>
                        </svg>
                      </button>
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      {cert && (
                        <button className="w-9 h-9 border border-white/10 hover:bg-white/[0.05] hover:border-white/15 transition-all text-silver-soft hover:text-white flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="4" y="3" width="10" height="12"/>
                            <path d="M7 6H11M7 9H11"/>
                          </svg>
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04] text-silver text-sm">
                      {formatDate(gem.createdAt)}
                    </td>
                    <td className="px-6 py-6 border-b border-white/[0.04]">
                      {gem.shareableLink && (
                        <button
                          onClick={() => handleCopyLink(gem.shareableLink!)}
                          className="w-9 h-9 border border-white/10 hover:bg-white/[0.05] hover:border-white/15 transition-all text-silver-soft hover:text-white flex items-center justify-center"
                        >
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 10L10 6M10 6V9M10 6H7"/>
                            <rect x="3" y="3" width="10" height="10"/>
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
