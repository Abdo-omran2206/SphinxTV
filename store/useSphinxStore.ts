import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Channel } from "@/types/channel";

interface SphinxState {
  channels: Channel[];
  selectedChannel: Channel | null;
  searchQuery: string;
  selectedCategory: string;
  selectedCountry: string;
  onlyFavorites: boolean;
  favorites: string[]; // List of channel IDs
  isLoading: boolean;
  error: string | null;

  // Actions
  setChannels: (channels: Channel[]) => void;
  setSelectedChannel: (channel: Channel | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedCountry: (country: string) => void;
  setOnlyFavorites: (onlyFavs: boolean) => void;
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetFilters: () => void;
}

export const useSphinxStore = create<SphinxState>()(
  persist(
    (set, get) => ({
      channels: [],
      selectedChannel: null,
      searchQuery: "",
      selectedCategory: "all",
      selectedCountry: "all",
      onlyFavorites: false,
      favorites: [],
      isLoading: false,
      error: null,

      setChannels: (channels) => set({ channels }),
      setSelectedChannel: (selectedChannel) => set({ selectedChannel }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSelectedCountry: (selectedCountry) => set({ selectedCountry }),
      setOnlyFavorites: (onlyFavorites) => set({ onlyFavorites }),

      toggleFavorite: (channelId) => {
        const { favorites } = get();
        if (favorites.includes(channelId)) {
          set({ favorites: favorites.filter((id) => id !== channelId) });
        } else {
          set({ favorites: [...favorites, channelId] });
        }
      },

      isFavorite: (channelId) => {
        return get().favorites.includes(channelId);
      },

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      resetFilters: () =>
        set({
          searchQuery: "",
          selectedCategory: "all",
          selectedCountry: "all",
          onlyFavorites: false,
        }),
    }),
    {
      name: "sphinxtv-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        favorites: state.favorites,
      }),
    }
  )
);

// Backward compatibility alias
export const useChannelStore = useSphinxStore;
