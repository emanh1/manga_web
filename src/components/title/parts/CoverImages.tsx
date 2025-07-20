import React, { useEffect, useState } from "react";
import type { TTitlePicture } from "@/types/titlePictures";
import { getTitlePictures } from "@/api/jikan";

export const CoverImages: React.FC<{ titleId: string | undefined }> = ({ titleId }) => {
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);
  const [artImages, setArtImages] = useState<TTitlePicture[]>([]);

  useEffect(() => {
    if (!titleId) return;

    setArtLoading(true);
    setArtError(null);

    getTitlePictures(Number(titleId))
      .then(data => setArtImages(data))
      .catch(() => setArtError("Failed to load art images."))
      .finally(() => setArtLoading(false));
  }, [titleId]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Art</h2>
      {artLoading ? (
        <div>Loading chapter covers...</div>
      ) : artError ? (
        <div className="text-red-500">{artError}</div>
      ) : artImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artImages.map((img, idx) => (
            <img
              key={idx}
              src={img.jpg.image_url}
              alt={`Art ${idx + 1}`}
              className="w-full rounded shadow"
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-600">No images found.</div>
      )}
    </div>
  );
};
