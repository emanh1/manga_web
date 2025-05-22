export type Manga = {
  mal_id: number;
  title: string;
  synopsis: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
};

export type MangaDetails = Manga & {
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