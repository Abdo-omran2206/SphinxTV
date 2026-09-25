"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function LiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SphinxTV Live error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-4 border border-gold/30 shadow-gold">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Unable to Load SphinxTV Live Broadcasts</h2>
      <p className="text-xs text-zinc-400 mb-6">
        An error occurred while communicating with the live stream providers.
      </p>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-gold-dark px-6 py-3 text-xs font-black text-slate-950 shadow-gold transition-transform hover:scale-105 active:scale-95"
      >
        <RotateCcw className="h-4 w-4" />
        Reconnect to SphinxTV
      </button>
    </div>
  );
}
