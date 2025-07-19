import { createContext, useContext } from 'react';
import type { TTitleChapter } from '../types/titles';
import type { TTitlePicture } from '../types/titlePictures';

interface TitleDetailsContextType {
  titleId: string | undefined;
  chapters: TTitleChapter[];
  chaptersByVolume: Record<string | number, TTitleChapter[]>;
  loading: boolean;
  artImages: TTitlePicture[];
  artLoading: boolean;
  artError: string | null;
  navigate: ReturnType<typeof import('react-router-dom').useNavigate>;
}

export const TitleDetailsContext = createContext<TitleDetailsContextType | undefined>(undefined);

export const useTitleDetailsContext = () => {
  const ctx = useContext(TitleDetailsContext);
  if (!ctx) throw new Error('useTitleDetailsContext must be used within TitleDetailsContext.Provider');
  return ctx;
};
