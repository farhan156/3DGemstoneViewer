import { create } from 'zustand';
import { Gemstone, Certificate } from '@/types/gemstone';
import { db } from '@/lib/firebase';
import { collection, addDoc, setDoc, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

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
      if (!db) {
        console.warn('Firebase not initialized - using local data only');
        set({ isLoading: false });
        return;
      }
      const querySnapshot = await getDocs(collection(db, 'gemstones'));
      const gemstones: Gemstone[] = [];
      querySnapshot.forEach((doc) => {
        gemstones.push({ ...doc.data(), id: doc.id } as Gemstone);
      });
      set({ gemstones });
    } catch (error) {
      console.warn('Could not fetch from Firestore (offline mode - using local data):', error);
      // Keep existing local gemstones
    } finally {
      set({ isLoading: false });
    }
  },

  addGemstone: async (gemstone) => {
    // Update local state immediately (for offline support)
    set((state) => ({
      gemstones: [...state.gemstones, gemstone],
    }));

    // Try to sync with Firestore (non-blocking)
    try {
      if (!db) {
        console.warn('Firebase not initialized - data saved locally only');
        return;
      }
      await setDoc(doc(db, 'gemstones', gemstone.id), gemstone);
      console.log('Gemstone synced to Firestore:', gemstone.id);
    } catch (error) {
      console.warn('Could not sync to Firestore (offline mode):', error);
      // Don't throw - local state is already updated
    }
  },

  updateGemstone: async (id, data) => {
    const gemstone = get().gemstones.find(g => g.id === id);
    if (!gemstone) return;
    
    const updatedGemstone = { ...gemstone, ...data, updatedAt: new Date().toISOString() };
    
    // Update local state immediately
    set((state) => ({
      gemstones: state.gemstones.map((gem) =>
        gem.id === id ? updatedGemstone : gem
      ),
    }));

    // Try to sync with Firestore (non-blocking)
    try {
      if (!db) {
        console.warn('Firebase not initialized - data updated locally only');
        return;
      }
      await updateDoc(doc(db, 'gemstones', id), updatedGemstone);
      console.log('Gemstone updated in Firestore:', id);
    } catch (error) {
      console.warn('Could not sync update to Firestore (offline mode):', error);
    }
  },

  deleteGemstone: async (id) => {
    // Update local state immediately
    set((state) => ({
      gemstones: state.gemstones.filter((gem) => gem.id !== id),
      certificates: state.certificates.filter((cert) => cert.gemstoneId !== id),
    }));

    // Try to sync with Firestore (non-blocking)
    try {
      if (!db) {
        console.warn('Firebase not initialized - data deleted locally only');
        return;
      }
      await deleteDoc(doc(db, 'gemstones', id));
      console.log('Gemstone deleted from Firestore:', id);
    } catch (error) {
      console.warn('Could not sync delete to Firestore (offline mode):', error);
    }
  },

  getGemstoneById: async (id: string) => {
    // Check local state first (offline support)
    const localGemstone = get().gemstones.find(g => g.id === id);
    if (localGemstone) {
      return localGemstone;
    }

    // Try Firebase if not in local state
    try {
      if (!db) {
        console.warn('Firebase not initialized');
        return null;
      }
      const docSnap = await getDoc(doc(db, 'gemstones', id));
      if (docSnap.exists()) {
        const gemstone = { ...docSnap.data(), id: docSnap.id } as Gemstone;
        // Add to local state for future lookups
        set((state) => ({
          gemstones: [...state.gemstones, gemstone],
        }));
        return gemstone;
      }
      return null;
    } catch (error) {
      console.warn('Could not fetch from Firestore (offline mode):', error);
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
