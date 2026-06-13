import { create } from "zustand";

// An album or playlist to open in the shared AlbumModal.
export interface OpenItem {
  title: string;
  subtitle: string;
  img: string;
  albumId?: number | string;
  playlistId?: number | string;
}

interface AppState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  targetArtist: string | null;
  setTargetArtist: (artist: string | null) => void;
  // Open a specific artist by Deezer id (precise — avoids same-name collisions).
  targetArtistId: number | null;
  setTargetArtistId: (id: number | null) => void;
  openItem: OpenItem | null;
  setOpenItem: (item: OpenItem | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: "home",
  setActiveTab: (tab) => set({ activeTab: tab }),
  targetArtist: null,
  setTargetArtist: (artist) => set({ targetArtist: artist }),
  targetArtistId: null,
  setTargetArtistId: (id) => set({ targetArtistId: id }),
  openItem: null,
  setOpenItem: (item) => set({ openItem: item }),
}));
