import { useEffect, useState, useCallback } from "react";
import { retryOperation } from "./retry";
import toast from "react-hot-toast";
import type { TMangaChapter } from "../types/manga";

interface UseChapterReaderOptions {
  mangaId?: string;
  chapterId?: string;
  fetchChapterFn: (mangaId: string, chapterId: string) => Promise<TMangaChapter>;
}

export function useChapterReader({ mangaId, chapterId, fetchChapterFn }: UseChapterReaderOptions) {
  const [chapter, setChapter] = useState<TMangaChapter | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchChapter = async () => {
    if (!mangaId || !chapterId) return;
    setLoading(true);
    try {
      const response = await retryOperation(
        () => fetchChapterFn(mangaId, chapterId),
        3,
        1000
      );
      setChapter(response);
      setPages(response.pages ?? []);
      setCurrentPage(0);
    } catch (error) {
      toast.error("Failed to load chapter after multiple attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, [mangaId, chapterId]);

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

  return {
    chapter,
    pages,
    currentPage,
    setCurrentPage,
    loading,
    nextPage,
    previousPage,
  };
}
