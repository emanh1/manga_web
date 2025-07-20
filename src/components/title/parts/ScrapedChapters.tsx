import React, { useEffect, useState, useMemo } from "react";
import type { TTitle } from "@/types/titles";
import { VolumeSection } from "./VolumeSection";
import { useNavigate } from "react-router-dom";
import { sources } from "@/backend/sources";
import type { Chapter as ScrapedChapter } from "@manga_web/sources";

function sortVolumes(a: [string | number, ScrapedChapter[]], b: [string | number, ScrapedChapter[]]) {
  if (a[0] === "Other") return -1;
  if (b[0] === "Other") return 1;
  return Number(b[0]) - Number(a[0]);
}

export const ScrapedChapters: React.FC<{ title: TTitle; navigate: ReturnType<typeof useNavigate> }> = ({ title, navigate }) => {
  const [chapters, setChapters] = useState<ScrapedChapter[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(true);
    sources.runSourceForChapters({
      manga: { malId: title.mal_id, title: title.title },
      id: 'readmanga'
    }).then(scrapedChapters => {
      setChapters(scrapedChapters)
    }).finally(() => setLoading(false))
  }, [title]);

  const chaptersByVolume = useMemo(() => {
    return chapters.reduce((acc, chapter) => {
      const volume = chapter.chapterVolume ?? "Other";
      if (!acc[volume]) acc[volume] = [];
      acc[volume].push(chapter);
      return acc;
    }, {} as Record<string | number, ScrapedChapter[]>);
  }, [chapters]);

  if (loading) return <div>Loading chapters...</div>;

  if (chapters.length === 0) {
    return <div className="text-gray-600">No chapters found.</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(chaptersByVolume)
        .sort(sortVolumes)
        .map(([volume, volumeChapters]) => (
          <VolumeSection
            key={volume}
            volume={volume}
            chapters={volumeChapters}
            titleId={String(title.mal_id)}
            navigate={navigate} />
        ))}
    </div>
  );
};
