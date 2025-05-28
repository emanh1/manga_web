import React from "react";
import { useParams } from "react-router-dom";
import { uploadAPI } from "../api/axios";
import { useChapterReader } from "../utils/useChapterReader";
import toast from 'react-hot-toast';

const Reader: React.FC = () => {
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
    fetchChapterFn: uploadAPI.getChapter,
  });

  if (loading || !chapter) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col items-center">
      <div className="mb-4 text-center">
        <h1 className="text-lg font-semibold">
          {chapter.chapterTitle || "Untitled"}
          {chapter.chapterNumber && ` - Chapter ${chapter.chapterNumber}`}
          {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
        </h1>
        <p className="text-sm text-gray-500">
          Uploaded by {chapter.uploader.username} ·{" "}
          {chapter.uploadedAt ? new Date(chapter.uploadedAt).toLocaleDateString() : ""}
        </p>
      </div>

      <div className="mb-6">
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

        <div className="flex gap-4 mt-2">
          <button
            onClick={previousPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === pages.length - 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reader;

