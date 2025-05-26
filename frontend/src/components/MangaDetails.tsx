import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMangaDetails } from "../api/jikan";
import type { TMangaDetails, MangaUploadChapter } from "../types/manga";
import toast from 'react-hot-toast';
import axiosInstance from "../api/axios";
import { useAuth } from "../contexts/AuthContext";

const MangaDetails: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manga, setManga] = useState<TMangaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<MangaUploadChapter[]>([]);

  useEffect(() => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;
    let retryCount = 0;

    async function fetchData() {
      if (!mangaId) return;
      setLoading(true);
      try {
        const [mangaData, chaptersData] = await Promise.all([
          getMangaDetails(parseInt(mangaId)),
          axiosInstance.get<MangaUploadChapter[]>(`/manga/uploads?malId=${mangaId}`)
        ]);

        setManga(mangaData);
        setChapters(chaptersData.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          toast.error(`Failed to load manga details. Retrying (${retryCount}/${MAX_RETRIES})...`);
          setTimeout(fetchData, RETRY_DELAY * retryCount);
        } else {
          toast.error('Failed to load manga details after multiple attempts');
          setChapters([]);
          setManga(null);
        }
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
  }, {} as Record<string | number, MangaUploadChapter[]>);

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
                  if (a === 'Other') return 1;
                  if (b === 'Other') return -1;
                  return Number(a) - Number(b);
                }).map(([volume, volumeChapters]) => (
                  <div key={volume} className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-lg font-semibold mb-3">
                      {volume === 'Other' ? 'Chapters' : `Volume ${volume}`}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {volumeChapters.sort((a, b) => (a.chapter ?? 0) - (b.chapter ?? 0))
                        .map((chapter) => (
                        <div
                          key={chapter.id}
                          onClick={() => navigate(`/manga/${mangaId}/chapter/${chapter.id}`)}
                          className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <div className="font-medium">
                            {chapter.chapter ? `Chapter ${chapter.chapter}` : 'Special Chapter'}
                            {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            Uploaded by {chapter.uploader.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(chapter.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm">
                            <span className={`inline-block px-2 py-0.5 rounded ${
                              chapter.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : chapter.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}
                            </span>
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