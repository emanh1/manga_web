import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { uploadAPI } from "../api/axios";
import type { TMangaChapter } from "../types/manga";
import toast from "react-hot-toast";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const Reader: React.FC = () => {
  const { mangaId, chapterId } = useParams();

  const [chapter, setChapter] = useState<TMangaChapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetchChapter = async () => {
    if (!mangaId || !chapterId) return;

    setLoading(true);
    try {
      const response = await uploadAPI.getChapter(mangaId, chapterId);
      console.log(response);
      setChapter(response);
      setPages(response.pages);
      setCurrentPage(0);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch chapter:", error);
      // if (retryCount < MAX_RETRIES) {
      //   const nextRetry = retryCount + 1;
      //   setRetryCount(nextRetry);
      //   toast.error(`Failed to load chapter. Retrying (${nextRetry}/${MAX_RETRIES})...`);
      // } else {
      //   toast.error("Failed to load chapter after multiple attempts");
      //   navigate(`/manga/${mangaId}`);
      // }
      setLoading(false);
    }
  };

  useEffect(() => {
    setRetryCount(0);
    fetchChapter();
  }, [mangaId, chapterId]);

  useEffect(() => {
    if (retryCount > 0 && retryCount <= MAX_RETRIES) {
      const timer = setTimeout(() => {
        fetchChapter();
      }, RETRY_DELAY * retryCount);
      return () => clearTimeout(timer);
    }
  }, [retryCount]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") nextPage();
      else if (event.key === "ArrowLeft") previousPage();
    },
    [pages.length, currentPage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const nextPage = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const previousPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

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
          {new Date(chapter.uploadedAt).toLocaleDateString()}
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

