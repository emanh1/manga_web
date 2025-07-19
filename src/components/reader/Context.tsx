import { createContext, useContext } from "react";
import type { TTitleChapter } from "../../types/titles";

export type ImageFit = 'no-limit' | 'fit-width' | 'fit-height' | 'fit-both';

export interface ReaderContextType {
  chapter: any;
  pages: any[];
  currentPage: number;
  setCurrentPage: (n: number) => void;
  loading: boolean;
  imgLoading: boolean;
  setImgLoading: (b: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (b: boolean) => void;
  chapterList: TTitleChapter[];
  chapterIndex: number | null;
  setChapterIndex: (n: number | null) => void;
  imageFit: ImageFit;
  setImageFit: (fit: ImageFit) => void;
  gateway: string;
  titleId: string | undefined;
  chapterId: string | undefined;
  navigate: (url: string) => void;
}

export const ReaderContext = createContext<ReaderContextType | undefined>(undefined);

export function useReaderContext() {
  const ctx = useContext(ReaderContext);
  if (!ctx) throw new Error("useReaderContext must be used within ReaderContextProvider");
  return ctx;
}
