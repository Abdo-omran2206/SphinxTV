import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";

export const metadata: Metadata = {
  title: "SphinxTV — Live Streaming & Channels",
  description:
    "Watch live TV channels, movies, news, and Egyptian broadcasts on SphinxTV. Smooth adaptive streaming on web and mobile.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-zinc-100 antialiased selection:bg-gold selection:text-slate-950 flex flex-col pb-14 md:pb-0">
        <Navbar />
        <main className="flex-1">{children}</main>
        <MobileNav />

        {/* Clean Footer */}
        <footer className="mt-auto border-t border-white/[0.06] bg-[#0d111a] py-6 text-center text-xs text-zinc-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <img src="/icon.png" alt="SphinxTV" className="h-4 w-4 object-contain" />
              <span className="font-semibold text-zinc-300">SphinxTV</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">Live TV Streaming Platform</span>
            </div>
            <p className="text-zinc-500">
              © {new Date().getFullYear()} SphinxTV. All live streams are hosted by their original broadcasters.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
