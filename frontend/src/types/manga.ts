export type TManga = {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
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
};

export type TMangaDetails = TManga & {
  status: string;
  chapters: number | null;
  score: number;
  genres: Array<{ name: string }>;
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
  };
};

export interface TMangaRecommendationEntry {
  mal_id: number;
  title: string;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
}

export interface TMangaRecommendation {
  mal_id: string;
  entry: TMangaRecommendationEntry[];
  content: string;
  user: {
    url: string;
    username: string;
  };
}

export interface TMangaChapter {
  chapterId: string;
  chapterNumber: number | null;
  volume: number | null;
  chapterTitle: string | null;
  language: string;
  isOneshot: boolean;
  uploadedAt: string;
  uploader: string;
  status: 'pending' | 'approved' | 'rejected';
}