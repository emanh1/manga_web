import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMangaDetails } from "../api/jikan";
import type { TManga, TMangaChapter } from "../types/manga";
import toast from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext";
import { uploadAPI } from "../api/axios";
import { retryOperation } from "../utils/retry";

const MangaDetails: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [manga, setManga] = useState<TManga | null>(null);
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
            <div>
              <h1 className="text-3xl font-bold">{manga.title}</h1>
              {manga.title_japanese && (
                <div className="text-base text-gray-500 mt-1">{manga.title_japanese}</div>
              )}
            </div>
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

          {/* --- Added: Manga Info Section --- */}
          <div className="mb-6 space-y-2">
            {/* Volumes */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Volumes:</span>
              <span className="inline-block text-sm text-gray-700">{manga.volumes ?? 'Unknown'}</span>
            </div>
            {/* Publishing Status */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Publishing Status:</span>
              {manga.status === 'Publishing' ? (
                <span className="inline-block text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">Publishing</span>
              ) : manga.status === 'Finished' ? (
                <span className="inline-block text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">Completed</span>
              ) : manga.status === 'On Hiatus' ? (
                <span className="inline-block text-xs bg-orange-100 text-orange-800 rounded px-2 py-0.5">Hiatus</span>
              ) : (
                <span className="inline-block text-xs bg-gray-100 text-gray-800 rounded px-2 py-0.5">{manga.status}</span>
              )}
            </div>
            {/* Serializations */}
            {manga.serializations.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-semibold">Serialization:</span>
                {manga.serializations.map((s: import("../types/manga").TMALEntity) => (
                  <span key={s.mal_id} className="inline-block text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 mr-1">{s.name}</span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Authors:</span>
              {manga.authors.length > 0 ? (
                manga.authors.map((a: import("../types/manga").TMALEntity, i: number) => (
                  <span key={a.mal_id} className="inline-block text-sm bg-gray-200 rounded px-2 py-0.5 mr-1">
                    {a.name}{i < manga.authors.length - 1 ? ',' : ''}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">Unknown</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Format:</span>
              <span className="inline-block text-xs bg-blue-100 text-blue-800 rounded px-2 py-0.5">
                Manga
              </span>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Demographic:</span>
              {manga.demographics.length > 0 ? (
                manga.demographics.map((d: import("../types/manga").TMALEntity) => (
                  <span key={d.mal_id} className="inline-block text-xs bg-green-100 text-green-800 rounded px-2 py-0.5 mr-1">
                    {d.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Genres:</span>
              {manga.genres.length > 0 ? (
                manga.genres.map((g: import("../types/manga").TMALEntity) => (
                  <span key={g.mal_id} className="inline-block text-xs bg-gray-200 text-gray-800 rounded px-2 py-0.5 mr-1">
                    {g.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Explicit Genres:</span>
              {manga.explicit_genres.length > 0 ? (
                manga.explicit_genres.map((g: import("../types/manga").TMALEntity) => (
                  <span key={g.mal_id} className="inline-block text-xs bg-red-200 text-red-800 rounded px-2 py-0.5 mr-1">
                    {g.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Themes:</span>
              {manga.themes.length > 0 ? (
                manga.themes.map((t: import("../types/manga").TMALEntity) => (
                  <span key={t.mal_id} className="inline-block text-xs bg-purple-100 text-purple-800 rounded px-2 py-0.5 mr-1">
                    {t.name}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">-</span>
              )}
            </div>
          </div>

          {/* Background */}
          {manga.background && (
            <div className="mb-6">
              <h3 className="font-semibold mb-1">Background</h3>
              <p className="text-gray-700 whitespace-pre-line">{manga.background}</p>
            </div>
          )}

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
            {/* Genres moved to above info section */}
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
                            Uploaded by {typeof chapter.uploader === 'object' ? chapter.uploader.username : chapter.uploader}
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