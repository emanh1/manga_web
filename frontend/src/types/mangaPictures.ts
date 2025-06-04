// Types for Jikan pictures endpoint
export interface TMangaPicture {
  jpg: {
    image_url: string;
  };
  webp: {
    image_url: string;
  };
}

export interface TMangaPicturesResponse {
  data: TMangaPicture[];
}
