import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { ManagedUser } from '@/types/user';

interface CustomCredentials {
  username: string;
  password: string;
  email: string;
  displayName: string;
}

interface CustomAuthUser {
  uid: string;
  email: string;
  displayName: string;
  providerId: 'custom';
}

const CUSTOM_CREDENTIALS_KEY = 'custom_login_credentials';
const CUSTOM_SESSION_KEY = 'custom_login_session';

const DEFAULT_CUSTOM_CREDENTIALS: CustomCredentials = {
  username: 'admin',
  password: 'Admin@12345',
  email: 'admin@gemstone.local',
  displayName: 'System Admin',
};

const getCustomCredentials = (): CustomCredentials => {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_CREDENTIALS;

  const raw = localStorage.getItem(CUSTOM_CREDENTIALS_KEY);
  if (!raw) {
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(DEFAULT_CUSTOM_CREDENTIALS));
    return DEFAULT_CUSTOM_CREDENTIALS;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CustomCredentials>;
    const merged = { ...DEFAULT_CUSTOM_CREDENTIALS, ...parsed };
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(DEFAULT_CUSTOM_CREDENTIALS));
    return DEFAULT_CUSTOM_CREDENTIALS;
  }
};

const saveCustomCredentials = (credentials: CustomCredentials) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_CREDENTIALS_KEY, JSON.stringify(credentials));
};

const buildCustomUser = (credentials: CustomCredentials): CustomAuthUser => ({
  uid: 'custom-admin',
  email: credentials.email,
  displayName: credentials.displayName,
  providerId: 'custom',
});

const isCustomAuthUser = (user: User | CustomAuthUser | null): user is CustomAuthUser => {
  return !!user && (user as CustomAuthUser).providerId === 'custom';
};

interface AuthStore {
  user: User | CustomAuthUser | null;
  isAuthLoading: boolean;
  initialized: boolean;
  managedUsers: ManagedUser[];
  isUsersLoading: boolean;

  initializeAuth: () => void;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentProfile: (name: string, email: string, password: string) => Promise<void>;

  fetchManagedUsers: () => Promise<void>;
  addManagedUser: (name: string, email: string, role: 'admin' | 'user') => Promise<void>;
  removeManagedUser: (id: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthLoading: true,
  initialized: false,
  managedUsers: [],
  isUsersLoading: false,

  initializeAuth: () => {
    if (get().initialized) return;

    set({ initialized: true, isAuthLoading: true });

    if (typeof window !== 'undefined') {
      const hasCustomSession = localStorage.getItem(CUSTOM_SESSION_KEY) === '1';
      if (hasCustomSession) {
        const credentials = getCustomCredentials();
        set({ user: buildCustomUser(credentials), isAuthLoading: false });
        return;
      }
    }

    // Only set up auth listener if auth is available
    if (auth) {
      onAuthStateChanged(auth, async (user) => {
        set({ user, isAuthLoading: false });

        if (user && db) {
          await setDoc(
            doc(db, 'users', user.uid),
            {
              name: user.displayName || '',
              email: user.email || '',
              role: 'admin',
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      });
    } else {
      set({ isAuthLoading: false });
    }
  },

  login: async (identifier, password) => {
    const normalizedIdentifier = identifier.trim();
    const credentials = getCustomCredentials();

    const isCustomMatch =
      (normalizedIdentifier === credentials.username || normalizedIdentifier === credentials.email) &&
      password === credentials.password;

    if (isCustomMatch) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(CUSTOM_SESSION_KEY, '1');
      }
      set({ user: buildCustomUser(credentials), isAuthLoading: false });
      return;
    }

    if (auth) {
      await signInWithEmailAndPassword(auth, normalizedIdentifier, password);
    }
  },

  logout: async () => {
    if (!auth) return;
    const currentUser = get().user;

    if (isCustomAuthUser(currentUser)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(CUSTOM_SESSION_KEY);
      }
      set({ user: null, isAuthLoading: false });
      return;
    }

    await signOut(auth);
  },

  updateCurrentProfile: async (name, email, password) => {
    if (!auth) return;
    const currentStateUser = get().user;

    if (isCustomAuthUser(currentStateUser)) {
      const currentCredentials = getCustomCredentials();
      const updatedCredentials: CustomCredentials = {
        username: currentCredentials.username,
        password: password.trim() || currentCredentials.password,
        email: email.trim() || currentCredentials.email,
        displayName: name.trim() || currentCredentials.displayName,
      };

      saveCustomCredentials(updatedCredentials);
      set({ user: buildCustomUser(updatedCredentials) });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No active user session');

    if (name.trim() && name.trim() !== (currentUser.displayName || '')) {
      await updateProfile(currentUser, { displayName: name.trim() });
    }

    if (email.trim() && email.trim() !== (currentUser.email || '')) {
      await updateEmail(currentUser, email.trim());
    }

    if (password.trim()) {
      await updatePassword(currentUser, password.trim());
    }

    await setDoc(
      doc(db, 'users', currentUser.uid),
      {
        name: name.trim(),
        email: email.trim() || currentUser.email || '',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    set({ user: auth.currentUser });
  },

  fetchManagedUsers: async () => {
    if (!db) return;
    set({ isUsersLoading: true });
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users: ManagedUser[] = [];
      snap.forEach((item) => {
        const data = item.data() as Omit<ManagedUser, 'id'>;
        users.push({
          id: item.id,
          name: data.name || '',
          email: data.email || '',
          role: data.role || 'user',
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      set({ managedUsers: users });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  addManagedUser: async (name, email, role) => {
    const newUser = {
      name: name.trim(),
      email: email.trim(),
      role,
      createdAt: new Date().toISOString(),
    };

    const ref = await addDoc(collection(db, 'users'), newUser);

    set((state) => ({
      managedUsers: [...state.managedUsers, { id: ref.id, ...newUser }],
    }));
  },

  removeManagedUser: async (id) => {
    await deleteDoc(doc(db, 'users', id));
    set((state) => ({ managedUsers: state.managedUsers.filter((u) => u.id !== id) }));
  },
}));
