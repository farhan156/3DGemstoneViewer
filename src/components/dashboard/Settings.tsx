'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function Settings() {
  const user = useAuthStore((state) => state.user);
  const managedUsers = useAuthStore((state) => state.managedUsers);
  const isUsersLoading = useAuthStore((state) => state.isUsersLoading);
  const fetchManagedUsers = useAuthStore((state) => state.fetchManagedUsers);
  const addManagedUser = useAuthStore((state) => state.addManagedUser);
  const removeManagedUser = useAuthStore((state) => state.removeManagedUser);
  const updateCurrentProfile = useAuthStore((state) => state.updateCurrentProfile);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'user'>('user');
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
  }, [user]);

  useEffect(() => {
    fetchManagedUsers();
  }, [fetchManagedUsers]);

  const handleSaveProfile = async () => {
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSavingProfile(true);
    try {
      await updateCurrentProfile(displayName, email, newPassword);
      setNewPassword('');
      toast.success('Profile updated');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Name and email are required');
      return;
    }

    setAddingUser(true);
    try {
      await addManagedUser(newUserName, newUserEmail, newUserRole);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('user');
      toast.success('User added');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add user';
      toast.error(message);
    } finally {
      setAddingUser(false);
    }
  };

  const handleRemoveUser = async (id: string) => {
    try {
      await removeManagedUser(id);
      toast.success('User removed');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove user';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="pb-6 border-b border-gray-light/50">
        <h1 className="font-serif text-4xl text-charcoal mb-1 tracking-tight">Settings</h1>
        <p className="text-gray-warm text-sm">Login profile and dashboard user management</p>
      </header>

      <section className="bg-white border border-gray-light/50 rounded-xl p-6 space-y-4">
        <h2 className="font-serif text-2xl text-charcoal">Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-charcoal mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              className="w-full h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="h-11 px-6 bg-gold text-white font-semibold text-sm rounded-xl hover:bg-gold-dark disabled:opacity-60 transition-all"
        >
          {savingProfile ? 'Saving...' : 'Save Profile'}
        </button>
      </section>

      <section className="bg-white border border-gray-light/50 rounded-xl p-6 space-y-5">
        <h2 className="font-serif text-2xl text-charcoal">User Management</h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_120px] gap-3">
          <input
            type="text"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            placeholder="Name"
            className="h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
          />
          <input
            type="email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            placeholder="Email"
            className="h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'user')}
            className="h-11 px-3 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={handleAddUser}
            disabled={addingUser}
            className="h-11 px-4 bg-charcoal text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-60 transition-all"
          >
            {addingUser ? 'Adding...' : 'Add User'}
          </button>
        </div>

        <div className="border border-gray-light/50 rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 px-4 py-3 bg-cream/50 text-xs font-semibold uppercase tracking-wider text-gray-warm">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span className="text-right">Action</span>
          </div>

          {isUsersLoading ? (
            <div className="py-8 text-center text-sm text-gray-warm">Loading users...</div>
          ) : managedUsers.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-warm">No users found.</div>
          ) : (
            <div className="divide-y divide-gray-light/40">
              {managedUsers.map((managedUser) => (
                <div key={managedUser.id} className="grid grid-cols-[1fr_1fr_100px_100px] gap-3 px-4 py-3 items-center">
                  <span className="text-sm text-charcoal truncate">{managedUser.name || '-'}</span>
                  <span className="text-sm text-charcoal truncate">{managedUser.email}</span>
                  <span className="text-xs font-semibold uppercase text-gray-warm">{managedUser.role}</span>
                  <div className="text-right">
                    <button
                      onClick={() => handleRemoveUser(managedUser.id)}
                      className="h-8 px-3 rounded-lg border border-ruby/30 text-ruby text-xs font-semibold hover:bg-ruby/10 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-xs text-gray-warm">
          User Management here stores dashboard members in Firestore. Login accounts are managed with Firebase Auth.
        </p>
      </section>
    </div>
  );
}
