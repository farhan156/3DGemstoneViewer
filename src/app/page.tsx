"use client";

export const revalidate = 0;

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/auth/login");
    }
  }, [isAuthLoading, router, user]);

  return null;
}
