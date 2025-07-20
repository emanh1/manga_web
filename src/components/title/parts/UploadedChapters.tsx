import React, { useEffect, useState, useMemo } from "react";
import type { TTitleChapter } from "@/types/titles";
import { VolumeSection } from "./VolumeSection";
import { useNavigate } from "react-router-dom";
import { titleAPI } from "@/api/axios";
import { toastUtil } from "@/components/toast";

function sortVolumes(a: [string | number, TTitleChapter[]], b: [string | number, TTitleChapter[]]) {
  if (a[0] === "Other") return -1;
  if (b[0] === "Other") return 1;
  return Number(b[0]) - Number(a[0]);
}

export const UploadedChapters: React.FC<{ titleId: string | undefined; navigate: ReturnType<typeof useNavigate> }> = ({ titleId, navigate }) => {
  const [chapters, setChapters] = useState<TTitleChapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!titleId) return;

    setLoading(true);
    titleAPI.getChapters(titleId)
      .then(data => setChapters(data.chapters))
      .catch(() => {
        toastUtil.error("Failed to load chapters");
        setChapters([]);
      })
      .finally(() => setLoading(false));
  }, [titleId]);

  const chaptersByVolume = useMemo(() => {
    return chapters.reduce((acc, chapter) => {
      const volume = chapter.volume ?? "Other";
      if (!acc[volume]) acc[volume] = [];
      acc[volume].push(chapter);
      return acc;
    }, {} as Record<string | number, TTitleChapter[]>);
  }, [chapters]);

  if (loading) return <div>Loading chapters...</div>;

  if (chapters.length === 0) {
    return <div className="text-gray-600">No chapters have been uploaded yet.</div>;
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
            titleId={titleId}
            navigate={navigate} />
        ))}
    </div>
  );
};
