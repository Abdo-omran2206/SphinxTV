"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default function WatchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("SphinxTV watch error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/15 text-gold mb-4 border border-gold/30 shadow-gold">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">SphinxTV Stream Unavailable</h2>
      <p className="text-xs text-zinc-400 mb-6">
        We were unable to establish a connection with this broadcast feed at this time.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-gold-dark px-5 py-2.5 text-xs font-black text-slate-950 shadow-gold transition-transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
          Reconnect
        </button>
        <Link
          href="/live"
          className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-surface px-5 py-2.5 text-xs font-bold text-zinc-300 transition-colors hover:border-gold hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Other Channels
        </Link>
      </div>
    </div>
  );
}
