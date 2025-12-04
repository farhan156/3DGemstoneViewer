import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Gemstone, Certificate } from '@/types/gemstone';

interface GemstoneStore {
  gemstones: Gemstone[];
  certificates: Certificate[];
  selectedGemstone: Gemstone | null;
  
  // Actions
  addGemstone: (gemstone: Gemstone) => void;
  updateGemstone: (id: string, data: Partial<Gemstone>) => void;
  deleteGemstone: (id: string) => void;
  selectGemstone: (gemstone: Gemstone | null) => void;
  
  addCertificate: (certificate: Certificate) => void;
  getCertificateByGemstoneId: (gemstoneId: string) => Certificate | undefined;
}

export const useGemstoneStore = create<GemstoneStore>()(
  persist(
    (set, get) => ({
      gemstones: [],
      certificates: [],
      selectedGemstone: null,

      addGemstone: (gemstone) =>
        set((state) => ({
          gemstones: [...state.gemstones, gemstone],
        })),

      updateGemstone: (id, data) =>
        set((state) => ({
          gemstones: state.gemstones.map((gem) =>
            gem.id === id ? { ...gem, ...data, updatedAt: new Date().toISOString() } : gem
          ),
        })),

      deleteGemstone: (id) =>
        set((state) => ({
          gemstones: state.gemstones.filter((gem) => gem.id !== id),
          certificates: state.certificates.filter((cert) => cert.gemstoneId !== id),
        })),

      selectGemstone: (gemstone) =>
        set({ selectedGemstone: gemstone }),

      addCertificate: (certificate) =>
        set((state) => ({
          certificates: [...state.certificates, certificate],
        })),

      getCertificateByGemstoneId: (gemstoneId) => {
        return get().certificates.find((cert) => cert.gemstoneId === gemstoneId);
      },
    }),
    {
      name: 'gemstone-storage',
    }
  )
);
