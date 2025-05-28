export interface TMALEntity {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface TManga {
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

export interface TMangaRecommendation {
  mal_id: string;
  entry: TManga[];
  content: string;
  user: {
    url: string;
    username: string;
  };
}

export interface TMangaChapter {
  chapterId: string;
  malId: number | null;
  volume: string | number | null;
  chapterNumber?: number | null;
  chapterTitle?: string | null;
  language: string;
  isOneshot: boolean;
  uploadedAt: string;
  createdAt: string;
  uploader: { username: string };
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  pages: { id: number; fileOrder: number; filePath: string }[];
}