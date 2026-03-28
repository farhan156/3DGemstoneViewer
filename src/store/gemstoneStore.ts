import { create } from 'zustand';
import { Gemstone, Certificate } from '@/types/gemstone';
import { db } from '@/lib/firebase';
import { collection, setDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

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
  getGemstoneById: (id: string) => Promise<Gemstone | null>;
  
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
      const querySnapshot = await getDocs(collection(db, 'gemstones'));
      const gemstones: Gemstone[] = [];
      querySnapshot.forEach((doc) => {
        gemstones.push({ ...doc.data(), id: doc.id } as Gemstone);
      });
      set({ gemstones });
    } catch (error) {
      console.error('Error fetching gemstones:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addGemstone: async (gemstone) => {
    try {
      // Clean undefined values because Firestore does not support it
      const cleanGemstone = { ...gemstone };
      Object.keys(cleanGemstone).forEach((key) => {
        if (cleanGemstone[key as keyof Gemstone] === undefined) {
          delete cleanGemstone[key as keyof Gemstone];
        }
      });

      // Use setDoc with our custom id so the Firestore document ID matches
      // the id field — this keeps /view/[id] links consistent.
      await setDoc(doc(db, 'gemstones', gemstone.id), cleanGemstone);
      set((state) => ({
        gemstones: [...state.gemstones, cleanGemstone],
      }));
    } catch (error) {
      console.error('Error adding gemstone:', error);
      throw error;
    }
  },

  updateGemstone: async (id, data) => {
    const gemstone = get().gemstones.find((g) => g.id === id);
    if (!gemstone) return;

    const updatedGemstone = {
      ...gemstone,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Clean undefined values because Firestore does not support it
    const cleanUpdatedGemstone = { ...updatedGemstone };
    Object.keys(cleanUpdatedGemstone).forEach((key) => {
      if (cleanUpdatedGemstone[key as keyof Gemstone] === undefined) {
        delete cleanUpdatedGemstone[key as keyof Gemstone];
      }
    });

    try {
      await updateDoc(doc(db, 'gemstones', id), cleanUpdatedGemstone as any);
      set((state) => ({
        gemstones: state.gemstones.map((gem) =>
          gem.id === id ? cleanUpdatedGemstone : gem
        ),
      }));
    } catch (error) {
      console.error('Error updating gemstone:', error);
      throw error;
    }
  },

  deleteGemstone: async (id) => {
    try {
      await deleteDoc(doc(db, 'gemstones', id));
      set((state) => ({
        gemstones: state.gemstones.filter((gem) => gem.id !== id),
        certificates: state.certificates.filter((cert) => cert.gemstoneId !== id),
      }));
    } catch (error) {
      console.error('Error deleting gemstone:', error);
      throw error;
    }
  },

  getGemstoneById: async (id: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'gemstones', id));
      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as Gemstone;
      }
      return null;
    } catch (error) {
      console.error('Error fetching gemstone:', error);
      return null;
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
