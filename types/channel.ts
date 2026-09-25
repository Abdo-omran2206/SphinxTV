export interface Channel {
  id: string;
  name: string;
  nativeName?: string | null;
  network?: string | null;
  country: string;
  subdivision?: string | null;
  city?: string | null;
  broadcastArea?: string[];
  languages?: string[];
  categories: string[];
  isNsfw: boolean;
  launched?: string | null;
  closed?: string | null;
  replacedBy?: string | null;
  website?: string | null;
  logo: string;
  streamUrl: string;
  streamQuality?: string | null;
  httpReferrer?: string | null;
  userAgent?: string | null;
}

export interface RawApiChannel {
  id: string;
  name: string;
  native_name?: string | null;
  network?: string | null;
  country: string;
  subdivision?: string | null;
  city?: string | null;
  broadcast_area?: string[];
  languages?: string[];
  categories?: string[];
  is_nsfw?: boolean;
  launched?: string | null;
  closed?: string | null;
  replaced_by?: string | null;
  website?: string | null;
  logo?: string | null;
}

export interface RawApiStream {
  channel: string;
  url: string;
  timeshift?: string | null;
  http_referrer?: string | null;
  user_agent?: string | null;
  quality?: string | null;
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedCountry: string;
  selectedLanguage: string;
  onlyFavorites: boolean;
}

export type CategoryOption = {
  id: string;
  name: string;
  count?: number;
};

export type CountryOption = {
  code: string;
  name: string;
  count?: number;
};
