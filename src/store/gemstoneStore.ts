import { create } from 'zustand';
import { Gemstone, Certificate } from '@/types/gemstone';

interface GemstoneStore {
  gemstones: Gemstone[];
  certificates: Certificate[];
  selectedGemstone: Gemstone | null;
  isLoading: boolean;
  
  // Actions
  fetchGemstones: () => Promise<void>;
  addGemstone: (gemstone: Gemstone) => Promise<void>;
  updateGemstone: (id: string, data: Partial<Gemstone>) => Promise<void>;
  deleteGemstone: (id: string) => Promise<void>;
  selectGemstone: (gemstone: Gemstone | null) => void;
  
  addCertificate: (certificate: Certificate) => void;
  getCertificateByGemstoneId: (gemstoneId: string) => Certificate | undefined;
}

export const useGemstoneStore = create<GemstoneStore>((set, get) => ({
  gemstones: [],
  certificates: [],
  selectedGemstone: null,
  isLoading: false,

  fetchGemstones: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/gemstones');
      if (response.ok) {
        const gemstones = await response.json();
        set({ gemstones });
      }
    } catch (error) {
      console.error('Error fetching gemstones:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGemstone: async (gemstone) => {
    try {
      const response = await fetch('/api/gemstones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gemstone),
      });
      
      if (response.ok) {
        set((state) => ({
          gemstones: [...state.gemstones, gemstone],
        }));
      }
    } catch (error) {
      console.error('Error adding gemstone:', error);
      throw error;
    }
  },

  updateGemstone: async (id, data) => {
    const gemstone = get().gemstones.find(g => g.id === id);
    if (!gemstone) return;
    
    const updatedGemstone = { ...gemstone, ...data, updatedAt: new Date().toISOString() };
    
    try {
      const response = await fetch(`/api/gemstones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedGemstone),
      });
      
      if (response.ok) {
        set((state) => ({
          gemstones: state.gemstones.map((gem) =>
            gem.id === id ? updatedGemstone : gem
          ),
        }));
      }
    } catch (error) {
      console.error('Error updating gemstone:', error);
      throw error;
    }
  },

  deleteGemstone: async (id) => {
    try {
      const response = await fetch(`/api/gemstones?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        set((state) => ({
          gemstones: state.gemstones.filter((gem) => gem.id !== id),
          certificates: state.certificates.filter((cert) => cert.gemstoneId !== id),
        }));
      }
    } catch (error) {
      console.error('Error deleting gemstone:', error);
      throw error;
    }
  },

  selectGemstone: (gemstone) =>
    set({ selectedGemstone: gemstone }),

  addCertificate: (certificate) =>
    set((state) => ({
      certificates: [...state.certificates, certificate],
    })),

  getCertificateByGemstoneId: (gemstoneId) => {
    return get().certificates.find((cert) => cert.gemstoneId === gemstoneId);
  },
}));
