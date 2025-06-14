import type { User } from "./user";

export interface TMALEntity {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface TTitle {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  title: string;
  title_english: string;
  title_japanese: string;
  chapters: number | null;
  volumes: number | null;
  status: string;
  publishing: boolean;
  published: {
    from: string | null;
    to: string | null;
    prop: {
      from: {
        day: number | null;
        month: number | null;
        year: number | null;
      };
      to: {
        day: number | null;
        month: number | null;
        year: number | null;
      };
    };
  };
  score: number;
  synopsis: string;
  background: string;

  authors: TMALEntity[]; 
  serializations: TMALEntity[];
  genres: TMALEntity[];
  explicit_genres: TMALEntity[]; 
  themes: TMALEntity[];
  demographics: TMALEntity[];
};

export interface TTitleRecommendation {
  mal_id: string;
  entry: TTitle[];
  content: string;
  user: {
    url: string;
    username: string;
  };
}

export interface TChapterPage {
  id: number;
  fileOrder: number;
  filePath: string;
}

export interface TTitleChapter {
  chapterId: string;
  malId: number | null;
  volume?: number | null;
  chapterNumber?: number | null;
  chapterTitle?: string | null;
  language: string;
  isOneshot: boolean;
  createdAt: string;
  uploader: User; 
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  pages: TChapterPage[];
  viewCount: number;
}