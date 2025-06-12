// Types for Jikan pictures endpoint
export interface TTitlePicture {
  jpg: {
    image_url: string;
  };
  webp: {
    image_url: string;
  };
}

export interface TTitlePicturesResponse {
  data: TTitlePicture[];
}
