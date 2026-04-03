import { create } from 'zustand';

export type CapturedPage = {
  id: string;
  dataUrl: string;
  fileName: string;
  capturedAt: string;
};

type AppState = {
  sessionId: string | null;
  pages: CapturedPage[];
  setSessionId: (sessionId: string | null) => void;
  addPage: (page: Omit<CapturedPage, 'id'>) => void;
  removePage: (pageId: string) => void;
  clearPages: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  sessionId: null,
  pages: [],
  setSessionId: (sessionId) => set({ sessionId }),
  addPage: (page) =>
    set((state) => ({
      pages: [
        {
          id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${state.pages.length}`,
          ...page,
        },
        ...state.pages,
      ],
    })),
  removePage: (pageId) =>
    set((state) => ({
      pages: state.pages.filter((page) => page.id !== pageId),
    })),
  clearPages: () => set({ pages: [] }),
}));
