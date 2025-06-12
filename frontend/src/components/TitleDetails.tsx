import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { TTitleChapter, TMALEntity, TTitle } from "../types/titles";
import { toastUtil } from './toast';
import { useAuth } from "../contexts/AuthContext";
import { titleAPI } from "../api/axios";
import { useTitleDetails } from "../hooks/useTitleDetails";
import { formatDistanceToNow } from 'date-fns';
import { FaClock, FaEye, FaUser, FaStar, FaUpload, FaPlus } from 'react-icons/fa';
import { getTitlePictures } from "../api/jikan";
import type { TTitlePicture } from "../types/titlePictures";

function sortVolumes(a: [string | number, TTitleChapter[]], b: [string | number, TTitleChapter[]]) {
  if (a[0] === 'Other') return -1;
  if (b[0] === 'Other') return 1;
  return Number(b[0]) - Number(a[0]);
}

function sortChaptersDesc(a: TTitleChapter, b: TTitleChapter) {
  return (b.chapterNumber ?? 0) - (a.chapterNumber ?? 0);
}

const ChapterListItem: React.FC<{
  chapter: TTitleChapter;
  titleId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ chapter, titleId, navigate }) => (
  <li
    key={chapter.chapterId}
    onClick={() => navigate(`/titles/${titleId}/${chapter.chapterId}`)}
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
  chapters: TTitleChapter[];
  titleId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ volume, chapters, titleId, navigate }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-3">
      {volume === 'Other' ? 'No volume' : `Volume ${volume}`}
    </h3>
    <ul className="divide-y divide-gray-200">
      {chapters.sort(sortChaptersDesc).map((chapter) => (
        <ChapterListItem key={chapter.chapterId} chapter={chapter} titleId={titleId} navigate={navigate} />
      ))}
    </ul>
  </div>
);

const TABS = [
  { label: "Chapters" },
  { label: "Comments (0)" }, //TODO: comments section
  { label: "Art" },
];

const CoverImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-auto md:w-56 rounded-lg shadow-lg" />
);

const TitleSection: React.FC<{ title: TTitle }> = ({ title }) => {
  const title_main = title.title?.trim() || "";
  const titleEnglish = title.title_english?.trim() || "";
  const titleJapanese = title.title_japanese?.trim() || "";
  const showEnglish = titleEnglish && (title_main.toLowerCase() !== titleEnglish.toLowerCase());

  return (
    <div>
      <h1 className="text-7xl font-bold">{title_main}</h1>
      {showEnglish ? (
        <div className="text-base text-gray-500 mt-1">{titleEnglish}</div>
      ) : titleJapanese && (
        <div className="text-base text-gray-500 mt-1">{titleJapanese}</div>
      )}
    </div>
  );
};

//TODO implement library management and rating functionality
const ActionButtons: React.FC<{ user: any; titleId: string | undefined; navigate: ReturnType<typeof useNavigate> }> = ({ user, titleId, navigate }) => (
  <div className="flex flex-row gap-3 items-center mt-2">
    <button
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
      type="button"
    >
      <FaPlus className="text-base" /> Add to Library 
    </button> 
    <button
      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
      type="button"
    >
      <FaStar className="text-base" /> Rate
    </button>
    {user && (
      <button
        onClick={() => navigate(`/upload/${titleId}`)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        type="button"
      >
        <FaUpload className="text-base" /> Upload
      </button>
    )}
  </div>
);

const TagsAndStatus: React.FC<{ title: any }> = ({ title }) => (
  <div className="mb-6 space-y-2">
    {/* Serializations */}
    {title.serializations.length > 0 && (
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold">Serialization:</span>
        {title.serializations.map((s: TMALEntity) => (
          <span key={s.mal_id} className="inline-block text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 mr-1">{s.name}</span>
        ))}
      </div>
    )}
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Authors:</span>
      {title.authors.length > 0 ? (
        title.authors.map((a: TMALEntity, i: number) => (
          <span key={a.mal_id} className="inline-block text-sm bg-gray-200 rounded px-2 py-0.5 mr-1">
            {a.name}{i < title.authors.length - 1 ? ',' : ''}
          </span>
        ))
      ) : (
        <span className="text-gray-500">Unknown</span>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Demographic:</span>
      {title.demographics.length > 0 ? (
        title.demographics.map((d: TMALEntity) => (
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
      {title.genres.length > 0 ? (
        title.genres.map((g: TMALEntity) => (
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
      {title.explicit_genres.length > 0 ? (
        title.explicit_genres.map((g: TMALEntity) => (
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
      {title.themes.length > 0 ? (
        title.themes.map((t: TMALEntity) => (
          <span key={t.mal_id} className="inline-block text-xs bg-purple-100 text-purple-800 rounded px-2 py-0.5 mr-1">
            {t.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
    </div>
  </div>
);

const Description: React.FC<{ synopsis?: string }> = ({ synopsis }) => (
  <p className="text-gray-600 mb-4">{synopsis || "No synopsis found"}</p>
);

const InfoBar: React.FC<{ title: any }> = ({ title }) => (
  <div className="flex flex-wrap gap-2 items-center mt-4">
      {title.genres.length > 0 ? (
        title.genres.map((g: TMALEntity) => (
          <span key={g.mal_id} className="inline-block text-xs bg-gray-200 text-gray-800 rounded px-2 py-0.5 mr-1">
            {g.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
      {title.themes.length > 0 ? (
        title.themes.map((t: TMALEntity) => (
          <span key={t.mal_id} className="inline-block text-xs bg-purple-100 text-purple-800 rounded px-2 py-0.5 mr-1">
            {t.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}

      <span className="font-semibold">Publication:</span>
      <span className="flex items-center gap-1">
        <span
          className={`inline-block w-3 h-3 rounded-full ${title.status === 'Publishing' ? 'bg-green-500' : 'bg-blue-400'}`}
        ></span>
        <span className="text-xs text-gray-700">{title.status}</span>
      </span>
  </div>
);

const ChaptersTab: React.FC<{
  loading: boolean;
  chapters: TTitleChapter[];
  chaptersByVolume: Record<string | number, TTitleChapter[]>;
  titleId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ loading, chapters, chaptersByVolume, titleId, navigate }) => (
  <div>
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
              titleId={titleId}
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
);

const CommentsTab: React.FC = () => (
  <div className="text-gray-600">Comments section coming soon.</div>
);

const ArtTab: React.FC<{
  artLoading: boolean;
  artError: string | null;
  artImages: TTitlePicture[];
}> = ({ artLoading, artError, artImages }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Art</h2>
    {artLoading ? (
      <div>Loading chapter covers</div>
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

const TitleDetails: React.FC = () => {
  const { titleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { title, loading: titleLoading, error } = useTitleDetails(titleId);
  const [chapters, setChapters] = useState<TTitleChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [artImages, setArtImages] = useState<TTitlePicture[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artError, setArtError] = useState<string | null>(null);

  useEffect(() => {
    if (!titleId) return;
    setLoading(true);
    titleAPI.getChapters(titleId)
      .then((chaptersData) => setChapters(chaptersData.chapters))
      .catch(() => {
        toastUtil.error('Failed to load chapters');
        setChapters([]);
      })
      .finally(() => setLoading(false));
  }, [titleId]);

  useEffect(() => {
    if (!titleId) return;
    if (selectedTab !== 2) return;
    setArtLoading(true);
    setArtError(null);
    getTitlePictures(Number(titleId))
      .then((data) => setArtImages(data))
      .catch(() => setArtError("Failed to load art images."))
      .finally(() => setArtLoading(false));
  }, [titleId, selectedTab]);

  const chaptersByVolume = useMemo(() =>
    chapters.reduce((acc, chapter) => {
      const volume = chapter.volume ?? 'Other';
      if (!acc[volume]) acc[volume] = [];
      acc[volume].push(chapter);
      return acc;
    }, {} as Record<string | number, TTitleChapter[]>), [chapters]);

  if (titleLoading || loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;
  if (!title) return <div>Title not found</div>;

  const coverUrl = title.images.jpg.large_image_url;

  return (
    <>
      {/* Background */}
      <div
        className="fixed inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${coverUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(32px)',
          opacity: 0.25,
        }}
        aria-hidden="true"
      />
      {/* Foreground */}
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-2 md:px-8 mt-8">
          <div className="flex flex-col md:flex-row gap-8 items-stretch">
            <CoverImage src={coverUrl} alt={title.title} />
            <div className="flex-1 w-full">
              <TitleSection title={title} />
              <div className="mt-4">
                <ActionButtons user={user} titleId={titleId} navigate={navigate} />
              </div>
              <InfoBar title={title} />
            </div>
          </div>
          <div className="mt-6">
            <Description synopsis={title.synopsis} />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-2 md:px-8 mt-8">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-2 md:px-8">
          <div className="flex flex-col justify-start items-start w-full">
            {selectedTab === 0 && (
              <TagsAndStatus title={title} />
            )}
          </div>
          <div className="md:col-span-2 flex flex-col justify-start items-start w-full">
            <div className="w-full">
              {selectedTab === 0 && (
                <ChaptersTab
                  loading={loading}
                  chapters={chapters}
                  chaptersByVolume={chaptersByVolume}
                  titleId={titleId}
                  navigate={navigate}
                />
              )}
              {selectedTab === 1 && <CommentsTab />}
              {selectedTab === 2 && (
                <ArtTab artLoading={artLoading} artError={artError} artImages={artImages} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default TitleDetails;