import type { TTitleChapter } from "@/types/titles";
import type { useNavigate } from "react-router-dom";
import { ChapterListItem } from "./ChapterListItem";
import type { Chapter as ScrapedChapter } from "@manga_web/sources";

function sortChaptersDesc(a: TTitleChapter | ScrapedChapter, b: TTitleChapter | ScrapedChapter) {
  return (b.chapterNumber ?? 0) - (a.chapterNumber ?? 0);
}

export const VolumeSection: React.FC<{
  volume: string | number;
  chapters: TTitleChapter[] | ScrapedChapter[];
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