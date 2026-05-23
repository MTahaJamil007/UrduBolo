import { create } from "zustand";

interface AudioStore {
  activeAudioId: string | null;
  setActiveAudioId: (id: string | null) => void;
}

export const useAudioStore = create<AudioStore>((set) => ({
  activeAudioId: null,
  setActiveAudioId: (id) => set({ activeAudioId: id }),
}));
