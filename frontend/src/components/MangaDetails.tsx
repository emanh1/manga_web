import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMangaDetails } from "../api/jikan";
import type { TMangaDetails, TChapter } from "../types/manga";
import toast from 'react-hot-toast';

const MangaDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState<TMangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<TChapter[]>([]);

  useEffect(() => {
    async function fetchManga() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getMangaDetails(parseInt(id));
        setManga(data);
        setChapters([]);
      } catch (error) {
        console.error(error);
        toast.error('Failed to fetch manga details');
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
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{manga.title}</h1>
            <button
              onClick={() => navigate(`/upload/${id}`)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Upload Chapter
            </button>
          </div>

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

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Read Chapters</h2>
            {loading ? (
              <div>Loading chapters...</div>
            ) : chapters.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {chapters.map((chapter) => (
                  <a
                    key={chapter.id}
                    href={chapter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Chapter {chapter.number}: {chapter.title}
                    <span className="text-sm text-gray-500 block">
                      Source: {chapter.source.name}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">
                No reading sources found for this manga.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;