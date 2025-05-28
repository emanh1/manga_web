import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMangaDetails } from "../api/jikan";
import type { TMangaDetails, TMangaChapter } from "../types/manga";
import toast from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext";
import { uploadAPI } from "../api/axios";
import { retryOperation } from "../utils/retry";

const MangaDetails: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manga, setManga] = useState<TMangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<TMangaChapter[]>([]);

  useEffect(() => {
    async function fetchData() {
      if (!mangaId) return;
      setLoading(true);
      try {
        const [mangaData, chaptersData] = await retryOperation(
          async () => Promise.all([
            getMangaDetails(parseInt(mangaId)),
            uploadAPI.getChapters(mangaId)
          ]),
          3,
          1000
        );
        setManga(mangaData);
        setChapters(chaptersData.chapters);
      } catch (error) {
        toast.error('Failed to load manga details after multiple attempts');
        setChapters([]);
        setManga(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [mangaId]);

  if (loading) return <div>Loading...</div>;
  if (!manga) return <div>Manga not found</div>;

  const chaptersByVolume = chapters.reduce((acc, chapter) => {
    const volume = chapter.volume ?? 'Other';
    if (!acc[volume]) {
      acc[volume] = [];
    }
    acc[volume].push(chapter);
    return acc;
  }, {} as Record<string | number, TMangaChapter[]>);

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
            {user && (
              <button
                onClick={() => navigate(`/upload/${mangaId}`)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Upload Chapter
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-4">{manga.synopsis || "No synopsis found"}</p>
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
              <p>{manga.score || "na"}/10</p>
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
              <div className="space-y-6">
                {Object.entries(chaptersByVolume).sort(([a], [b]) => {
                  if (a === 'Other') return -1;
                  if (b === 'Other') return 1;
                  return Number(a) - Number(b);
                }).map(([volume, volumeChapters]) => (
                  <div key={volume} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      {volume === 'Other' ? 'No volume' : `Volume ${volume}`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {volumeChapters.sort((a, b) => (a.chapterNumber ?? 0) - (b.chapterNumber ?? 0))
                        .map((chapter) => (
                        <div
                          key={chapter.chapterId}
                          onClick={() => navigate(`/manga/${mangaId}/${chapter.chapterId}`)}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="font-medium">
                            {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}` : 'Special Chapter'}
                            {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            Uploaded by {chapter.uploader}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(chapter.uploadedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">
                No chapters have been uploaded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;