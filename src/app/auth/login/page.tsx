"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      router.replace("/dashboard");
    }
  }, [isAuthLoading, router, user]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      toast.error("Username/email and password are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(identifier.trim(), password);
      toast.success("Logged in");
      router.replace("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pearl flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-light/50 rounded-2xl p-8 shadow-sm space-y-6">
        <div>
          <h1 className="font-serif text-3xl text-charcoal mb-1">Login</h1>
          <p className="text-sm text-gray-warm">
            Sign in to access dashboard and settings.
          </p>
          <p className="text-xs text-gray-warm mt-2">
            Custom login: username admin, password Admin@12345
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Username or Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin or your Firebase email"
              className="w-full h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 bg-pearl border border-gray-light rounded-lg focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={isSubmitting}
          className="w-full h-11 bg-gold text-white font-semibold rounded-xl hover:bg-gold-dark disabled:opacity-60 transition-all"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
        </button>
      </div>
    </div>
  );
}
