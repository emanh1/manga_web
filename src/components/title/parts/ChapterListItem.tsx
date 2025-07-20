import type { TTitleChapter } from "@/types/titles";
import type { Chapter as ScrapedChapter } from "@manga_web/sources";
import { FaClock, FaEye, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";

function isTTitleChapter(chapter: any): chapter is TTitleChapter {
  return 'createdAt' in chapter && 'viewCount' in chapter && 'uploader' in chapter;
}

export const ChapterListItem: React.FC<{
  chapter: TTitleChapter | ScrapedChapter;
  titleId: string | undefined;
  navigate: ReturnType<typeof useNavigate>;
}> = ({ chapter, titleId, navigate }) => {
  if (isTTitleChapter(chapter)) {
    // Render for TTitleChapter, with all metadata
    return (
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
            {chapter.createdAt && (
              <span>
                <FaClock className="inline-block align-middle mr-1 text-sm" />
                {formatDistanceToNow(new Date(chapter.createdAt), { addSuffix: true })}
              </span>
            )}
            <span>
              <FaEye className="inline-block align-middle mr-1 text-sm" /> {chapter.viewCount}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[120px]">
          {chapter.uploader && (
            <Link
              to={`/profile/${chapter.uploader.userId}`}
              className="text-purple-600 hover:underline text-xs"
              onClick={e => e.stopPropagation()}
            >
              <FaUser className="inline-block align-middle mr-1 text-sm" /> {chapter.uploader.username}
            </Link>
          )}
        </div>
      </li>
    );
  } else {

    return (
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
          {chapter.date && (
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
              <span>
                <FaClock className="inline-block align-middle mr-1 text-sm" />
                {chapter.date}
              </span>
            </div>
          )}
        </div>
      </li>
    );
  }
};

