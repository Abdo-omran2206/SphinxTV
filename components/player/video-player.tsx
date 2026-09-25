"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  AlertCircle,
  Loader2,
  Settings,
  Check,
  Shield,
} from "lucide-react";
import { Channel } from "@/types/channel";

interface VideoPlayerProps {
  channel: Channel;
}

interface QualityLevel {
  index: number;
  height: number;
  width?: number;
  bitrate?: number;
  label: string;
}

export function VideoPlayer({ channel }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [useProxy, setUseProxy] = useState(false);
  const [retryingWithProxy, setRetryingWithProxy] = useState(false);

  // Quality Switching State
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 is Auto
  const [currentResolution, setCurrentResolution] = useState<string>("");
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Reset proxy state when channel changes
  useEffect(() => {
    setUseProxy(false);
    setRetryingWithProxy(false);
  }, [channel.id]);

  // Build the effective stream URL (direct or proxied)
  const getEffectiveStreamUrl = useCallback(
    (isProxy: boolean) => {
      if (!channel.streamUrl) return "";
      if (isProxy) {
        let proxyUrl = `/api/stream/proxy?url=${encodeURIComponent(channel.streamUrl)}`;
        if (channel.httpReferrer) {
          proxyUrl += `&referer=${encodeURIComponent(channel.httpReferrer)}`;
        }
        if (channel.userAgent) {
          proxyUrl += `&ua=${encodeURIComponent(channel.userAgent)}`;
        }
        return proxyUrl;
      }
      return channel.streamUrl;
    },
    [channel.streamUrl, channel.httpReferrer, channel.userAgent]
  );

  // Close quality menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        qualityMenuRef.current &&
        !qualityMenuRef.current.contains(event.target as Node)
      ) {
        setShowQualityMenu(false);
      }
    };

    if (showQualityMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showQualityMenu]);

  // Initialize and load stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.streamUrl) return;

    setIsLoading(true);
    setError(null);
    setQualities([]);
    setSelectedQuality(-1);
    setCurrentResolution("");
    retryCountRef.current = 0;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const currentStreamUrl = getEffectiveStreamUrl(useProxy);

    const handleHlsPlayback = () => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          fragLoadingTimeOut: 20000,
          manifestLoadingTimeOut: 20000,
        });

        hlsRef.current = hls;
        hls.loadSource(currentStreamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsLoading(false);
          setError(null);

          // Extract available quality levels
          if (data.levels && data.levels.length > 0) {
            const availableLevels: QualityLevel[] = data.levels.map((level, index) => {
              const height = level.height || 0;
              let label = height > 0 ? `${height}p` : `Level ${index + 1}`;
              if (height >= 1080) label += " HD";
              else if (height >= 720) label += " HD";
              return {
                index,
                height,
                width: level.width,
                bitrate: level.bitrate,
                label,
              };
            });

            availableLevels.sort((a, b) => b.height - a.height);
            setQualities(availableLevels);
          }

          // Try play, fallback to muted autoplay if unmuted fails
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => setIsPlaying(false));
            });
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          const activeLevel = hls.levels[data.level];
          if (activeLevel && activeLevel.height) {
            setCurrentResolution(`${activeLevel.height}p`);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) {
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            retryCountRef.current += 1;

            if (!useProxy && !retryingWithProxy) {
              hls.destroy();
              hlsRef.current = null;
              setRetryingWithProxy(true);
              setUseProxy(true);
              return;
            }

            if (retryCountRef.current <= maxRetries) {
              setTimeout(() => {
                if (hlsRef.current) {
                  hlsRef.current.startLoad();
                }
              }, 1000);
              return;
            }

            hls.destroy();
            hlsRef.current = null;
            setError("This broadcast feed is currently offline or unreachable.");
            setIsLoading(false);
            return;
          }

          hls.destroy();
          hlsRef.current = null;
          setError("Unable to play stream format.");
          setIsLoading(false);
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = currentStreamUrl;
        video.addEventListener("loadedmetadata", () => {
          setIsLoading(false);
          video
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true;
              setIsMuted(true);
              video.play().catch(() => setIsPlaying(false));
            });
        });

        video.addEventListener("error", () => {
          if (!useProxy) {
            setUseProxy(true);
          } else {
            setError("Unable to load video stream.");
            setIsLoading(false);
          }
        });
      } else {
        setError("HLS playback is not supported in this browser.");
        setIsLoading(false);
      }
    };

    handleHlsPlayback();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, channel.streamUrl, useProxy, getEffectiveStreamUrl, retryingWithProxy]);

  const handleQualityChange = (levelIndex: number) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setSelectedQuality(levelIndex);
    setShowQualityMenu(false);

    if (levelIndex !== -1) {
      const selected = qualities.find((q) => q.index === levelIndex);
      if (selected) {
        setCurrentResolution(selected.label);
      }
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVol = parseFloat(e.target.value);
    video.volume = newVol;
    setVolume(newVol);
    if (newVol === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showQualityMenu) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleRetry = (forceProxy?: boolean) => {
    setError(null);
    setIsLoading(true);
    retryCountRef.current = 0;

    if (typeof forceProxy === "boolean") {
      setUseProxy(forceProxy);
    } else {
      setUseProxy((prev) => !prev);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showQualityMenu && setShowControls(false)}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/[0.08] select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        className="h-full w-full object-contain cursor-pointer"
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onClick={togglePlay}
      />

      {/* Loading Spinner */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-gold mb-2" />
          <p className="text-xs text-zinc-300 font-medium">Connecting to live feed...</p>
        </div>
      )}

      {/* Error Overlay with Clean Human Fallback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-40 overflow-y-auto">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.08] text-zinc-300 mb-3">
            <AlertCircle className="h-5 w-5 text-accent-red" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white mb-1">
            Broadcast Signal Offline
          </h3>
          <p className="max-w-sm text-xs text-zinc-400 mb-4">{error}</p>

          <div className="flex items-center gap-2 mb-5">
            <button
              onClick={() => handleRetry(false)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-surface px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Retry Stream
            </button>
            <button
              onClick={() => handleRetry(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gold hover:bg-gold-hover px-3 py-1.5 text-xs font-semibold text-slate-950 transition-colors"
            >
              <Shield className="h-3 w-3" />
              Try Proxy Mode
            </button>
          </div>

          {/* Quick Active Channels */}
          <div className="border-t border-white/[0.08] pt-3.5 w-full max-w-sm">
            <span className="text-[11px] font-medium text-zinc-400 block mb-2">
              Popular live channels working right now:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Link
                href="/watch/AlJazeeraEnglish.qa"
                className="rounded-md border border-white/[0.08] bg-surface/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-gold hover:border-gold/40 transition-colors"
              >
                Al Jazeera HD
              </Link>
              <Link
                href="/watch/DWEnglish.de"
                className="rounded-md border border-white/[0.08] bg-surface/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-gold hover:border-gold/40 transition-colors"
              >
                DW English
              </Link>
              <Link
                href="/watch/France24English.fr"
                className="rounded-md border border-white/[0.08] bg-surface/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-gold hover:border-gold/40 transition-colors"
              >
                France 24
              </Link>
              <Link
                href="/watch/RedBullTV.us"
                className="rounded-md border border-white/[0.08] bg-surface/80 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-gold hover:border-gold/40 transition-colors"
              >
                Red Bull TV
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Overlay */}
      <div
        className={`absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {channel.logo ? (
            <img
              src={channel.logo}
              alt={channel.name}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-lg bg-surface p-0.5 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <img src="/icon.png" alt="SphinxTV" className="h-5 w-5 object-contain" />
          )}
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-white">
              {channel.name}
            </h2>
          </div>
        </div>

        {/* Live Pill & Proxy indicator */}
        <div className="flex items-center gap-2">
          {useProxy && (
            <span className="rounded bg-white/[0.1] px-2 py-0.5 text-[10px] text-zinc-300">
              Proxy Mode
            </span>
          )}
          <div className="flex items-center gap-1 rounded bg-accent-red/90 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause & Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>

            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-zinc-300 hover:text-white transition-colors"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4 text-accent-red" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-gold cursor-pointer h-1 bg-zinc-700 rounded-lg"
              />
            </div>
          </div>

          {/* Right: Quality, Retry & Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Quality Picker */}
            <div className="relative" ref={qualityMenuRef}>
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1 rounded-md border border-white/[0.1] bg-black/40 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
                title="Video Quality"
              >
                <Settings className="h-3 w-3 text-zinc-400" />
                <span>
                  {selectedQuality === -1
                    ? currentResolution
                      ? `Auto (${currentResolution})`
                      : "Auto"
                    : qualities.find((q) => q.index === selectedQuality)?.label || "Auto"}
                </span>
              </button>

              {/* Quality Menu Popover */}
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-40 rounded-xl border border-white/[0.1] bg-[#151c28] p-1.5 shadow-popover z-50">
                  <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase">
                    Quality
                  </div>

                  {/* Auto */}
                  <button
                    onClick={() => handleQualityChange(-1)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedQuality === -1
                        ? "bg-white/[0.08] text-gold"
                        : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <span>
                      Auto{" "}
                      {currentResolution && (
                        <span className="text-[10px] text-zinc-500 font-normal">
                          ({currentResolution})
                        </span>
                      )}
                    </span>
                    {selectedQuality === -1 && <Check className="h-3 w-3 text-gold" />}
                  </button>

                  {/* Resolutions */}
                  {qualities.map((quality) => (
                    <button
                      key={quality.index}
                      onClick={() => handleQualityChange(quality.index)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                        selectedQuality === quality.index
                          ? "bg-white/[0.08] text-gold"
                          : "text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span>{quality.label}</span>
                      {selectedQuality === quality.index && (
                        <Check className="h-3 w-3 text-gold" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Refresh */}
            <button
              onClick={() => handleRetry()}
              className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Refresh Stream"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="text-zinc-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-3.5 w-3.5" /> : <Maximize className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
