"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PublicViewer from "@/components/viewer/PublicViewer";
import { Gemstone } from "@/types/gemstone";
import { useGemstoneStore } from "@/store/gemstoneStore";

export default function ViewerPage() {
  const params = useParams();
  const [gemstone, setGemstone] = useState<Gemstone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getGemstoneById = useGemstoneStore((state) => state.getGemstoneById);
  const allGemstones = useGemstoneStore((state) => state.gemstones);

  useEffect(() => {
    const fetchGemstone = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getGemstoneById(params.id as string);
        if (data) {
          setGemstone(data);
        } else {
          setError("Gemstone not found");
        }
      } catch (error) {
        console.error("Error fetching gemstone:", error);
        setError("Error loading gemstone");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchGemstone();
    }
  }, [params.id, getGemstoneById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-charcoal">Loading gemstone...</p>
        </div>
      </div>
    );
  }

  if (error || !gemstone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pearl">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-serif text-charcoal mb-4">
            Gemstone Not Found
          </h1>
          <p className="text-gray-warm mb-6">
            {error || "The requested gemstone could not be found."}
          </p>
          <p className="text-sm text-gray-warm">
            Available gemstones: {allGemstones.length}
          </p>
          <a
            href="/dashboard"
            className="inline-block mt-6 px-6 py-3 bg-gold text-white rounded-lg hover:bg-gold-dark transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <PublicViewer gemstone={gemstone} />;
}
