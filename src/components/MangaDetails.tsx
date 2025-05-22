import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMangaDetails } from "../api/jikan";
import type { TMangaDetails } from "../types/manga";

const MangaDetails: React.FC = () => {
  const { id } = useParams();
  const [manga, setManga] = useState<TMangaDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchManga() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getMangaDetails(parseInt(id));
        setManga(data);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    fetchManga();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!manga) return <div>Manga not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <img
          src={manga.images.jpg.large_image_url}
          alt={manga.title}
          className="w-full rounded-lg shadow-lg"
        />
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{manga.title}</h1>
          <p className="text-gray-600 mb-4">{manga.synopsis}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{manga.status}</p>
            </div>
            <div>
              <h3 className="font-semibold">Chapters</h3>
              <p>{manga.chapters || "Unknown"}</p>
            </div>
            <div>
              <h3 className="font-semibold">Score</h3>
              <p>{manga.score}/10</p>
            </div>
            <div>
              <h3 className="font-semibold">Genres</h3>
              <p>{manga.genres.map(g => g.name).join(", ")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;