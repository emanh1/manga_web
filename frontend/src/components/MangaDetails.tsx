import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { TMangaChapter, TMALEntity } from "../types/manga";
import toast from 'react-hot-toast';
import { useAuth } from "../contexts/AuthContext";
import { uploadAPI } from "../api/axios";
import { useMangaDetails } from "../hooks/useMangaDetails";
import { formatDistanceToNow } from 'date-fns';
import { FaClock, FaEye, FaUser } from 'react-icons/fa';
import { getMangaPictures } from "../api/jikan";
import type { TMangaPicture } from "../types/mangaPictures";

function sortVolumes(a: [string | number, TMangaChapter[]], b: [string | number, TMangaChapter[]]) {
  if (a[0] === 'Other') return -1;
  if (b[0] === 'Other') return 1;
  return Number(b[0]) - Number(a[0]);
}

function sortChaptersDesc(a: TMangaChapter, b: TMangaChapter) {
  return (b.chapterNumber ?? 0) - (a.chapterNumber ?? 0);
}

const ChapterListItem: React.FC<{
  chapter: TMangaChapter;
  mangaId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ chapter, mangaId, navigate }) => (
  <li
    key={chapter.chapterId}
    onClick={() => navigate(`/manga/${mangaId}/${chapter.chapterId}`)}
    className="py-3 px-2 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
  >
    <div className="flex-1 min-w-0">
      <div className="font-medium truncate">
        {chapter.chapterNumber ? `Chapter ${chapter.chapterNumber}` : 'Special Chapter'}
        {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
        <span><FaClock className="inline-block align-middle mr-1 text-sm"/> {formatDistanceToNow(new Date(chapter.uploadedAt), {addSuffix: true})}</span>
        <span>
          <FaEye className="inline-block align-middle mr-1 text-sm"/> {chapter.viewCount}
        </span>
      </div>
    </div>
    <div className="flex flex-col items-end min-w-[120px]">
      <div className="text-xs text-gray-600">
        <Link
          to={`/profile/${chapter.uploader.uuid}`}
          className="text-purple-600 hover:underline"
          onClick={e => e.stopPropagation()}
        >
          <FaUser className="inline-block align-middle mr-1 text-sm"/> {chapter.uploader.username}
        </Link>
      </div>
    </div>
  </li>
);

const VolumeSection: React.FC<{
  volume: string | number;
  chapters: TMangaChapter[];
  mangaId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ volume, chapters, mangaId, navigate }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-3">
      {volume === 'Other' ? 'No volume' : `Volume ${volume}`}
    </h3>
    <ul className="divide-y divide-gray-200">
      {chapters.sort(sortChaptersDesc).map((chapter) => (
        <ChapterListItem key={chapter.chapterId} chapter={chapter} mangaId={mangaId} navigate={navigate} />
      ))}
    </ul>
  </div>
);

const TABS = [
  { label: "Chapters" },
  { label: "Comments (0)" }, //TODO: comments section
  { label: "Art" },
];

const MangaDetails: React.FC = () => {
  const { mangaId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { manga, loading: mangaLoading, error } = useMangaDetails(mangaId);
  const [chapters, setChapters] = useState<TMangaChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [artImages, setArtImages] = useState<TMangaPicture[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  useEffect(() => {
    if (!mangaId) return;
    setLoading(true);
    uploadAPI.getChapters(mangaId)
      .then((chaptersData) => setChapters(chaptersData.chapters))
      .catch(() => {
        toast.error('Failed to load chapters');
        setChapters([]);
      })
      .finally(() => setLoading(false));
  }, [mangaId]);

  useEffect(() => {
    if (!mangaId) return;
    if (selectedTab !== 2) return;
    setArtLoading(true);
    setArtError(null);
    getMangaPictures(Number(mangaId))
      .then((data) => setArtImages(data))
      .catch(() => setArtError("Failed to load art images."))
      .finally(() => setArtLoading(false));
  }, [mangaId, selectedTab]);

  const chaptersByVolume = useMemo(() =>
    chapters.reduce((acc, chapter) => {
      const volume = chapter.volume ?? 'Other';
      if (!acc[volume]) acc[volume] = [];
      acc[volume].push(chapter);
      return acc;
    }, {} as Record<string | number, TMangaChapter[]>), [chapters]);

  if (mangaLoading || loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
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
                {manga.serializations.map((s: TMALEntity) => (
                  <span key={s.mal_id} className="inline-block text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 mr-1">{s.name}</span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-semibold">Authors:</span>
              {manga.authors.length > 0 ? (
                manga.authors.map((a: TMALEntity, i: number) => (
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
                manga.demographics.map((d: TMALEntity) => (
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
                manga.genres.map((g: TMALEntity) => (
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
                manga.explicit_genres.map((g: TMALEntity) => (
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
                manga.themes.map((t: TMALEntity) => (
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
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <div className="flex space-x-2 border-b mb-4">
              {TABS.map((tab, idx) => (
                <button
                  key={tab.label}
                  className={`px-4 py-2 text-sm font-medium focus:outline-none border-b-2 transition-colors ${
                    selectedTab === idx
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-500 hover:text-indigo-600"
                  }`}
                  onClick={() => setSelectedTab(idx)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div>
              {selectedTab === 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Read Chapters</h2>
                  {loading ? (
                    <div>Loading chapters...</div>
                  ) : chapters.length > 0 ? (
                    <div className="space-y-6">
                      {Object.entries(chaptersByVolume)
                        .sort(sortVolumes)
                        .map(([volume, volumeChapters]) => (
                          <VolumeSection
                            key={volume}
                            volume={volume}
                            chapters={volumeChapters}
                            mangaId={mangaId}
                            navigate={navigate}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-gray-600">
                      No chapters have been uploaded yet.
                    </div>
                  )}
                </div>
              )}
              {selectedTab === 1 && (
                <div className="text-gray-600">Comments section coming soon.</div>
              )}
              {selectedTab === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Art</h2>
                  {artLoading ? (
                    <div>Loading art images...</div>
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
                    <div className="text-gray-600">No art images found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;