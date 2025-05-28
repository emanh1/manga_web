import React from "react";
import { useParams } from "react-router-dom";
import { uploadAPI } from "../api/axios";
import { useChapterReader } from "../utils/useChapterReader";
import toast from 'react-hot-toast';

const PreviewReader: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const {
    chapter,
    pages,
    currentPage,
    setCurrentPage,
    loading,
    nextPage,
    previousPage,
  } = useChapterReader({
    mangaId,
    chapterId,
    fetchChapterFn: uploadAPI.previewChapter,
  });

  if (loading || !chapter) return <div className="p-4">Loading preview...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col items-center">
      <div className="mb-4 text-center">
        <h1 className="text-lg font-semibold">
          {chapter.chapterTitle || "Untitled"}
          {chapter.chapterNumber && ` - Chapter ${chapter.chapterNumber}`}
          {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
        </h1>
        <p className="text-sm text-gray-500">
          Uploaded by {chapter.uploader.username}
        </p>
      </div>

      <div className="mb-6 relative w-full flex justify-center">
        <img
          src={pages[currentPage].filePath}
          alt={`Page ${currentPage + 1}`}
          className="max-h-[80vh] w-auto shadow-lg rounded"
          onError={(e) => {
            const img = e.currentTarget;
            const alreadyRetried = img.dataset.retried === "true";
            if (!alreadyRetried) {
              img.dataset.retried = "true";
              img.src = img.src.replace("ipfs.io", "cloudflare-ipfs.com");
              toast.error("Failed to load image. Retrying with alternate gateway...");
            } else {
              toast.error("Image failed to load on both gateways");
            }
          }}
        />
        <button
          className="absolute top-0 left-0 h-full w-1/2 cursor-pointer z-10"
          style={{ background: "rgba(0,0,0,0)", borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
          onClick={previousPage}
          disabled={currentPage === 0}
        />
        <button
          className="absolute top-0 right-0 h-full w-1/2 cursor-pointer z-10"
          style={{ background: "rgba(0,0,0,0)", borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
        />
      </div>

      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <input
          type="range"
          min={0}
          max={pages.length - 1}
          value={currentPage}
          onChange={(e) => setCurrentPage(parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between w-full text-sm text-gray-600">
          <span>Page {currentPage + 1}</span>
          <span>{pages.length} pages</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewReader;
