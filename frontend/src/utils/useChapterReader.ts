import { useEffect, useState, useCallback } from "react";
import { retryOperation } from "./retry";
import toast from "react-hot-toast";
import type { TMangaChapter, TMangaPage } from "../types/manga";

interface UseChapterReaderOptions {
  mangaId?: string;
  chapterId?: string;
  fetchChapterFn: (mangaId: string, chapterId: string) => Promise<TMangaChapter>;
}

export function useChapterReader({ mangaId, chapterId, fetchChapterFn }: UseChapterReaderOptions) {
  const [chapter, setChapter] = useState<TMangaChapter | null>(null);
  const [pages, setPages] = useState<TMangaPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  }, [currentPage, pages.length]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }, [currentPage]);

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
    } catch {
      toast.error("Failed to load chapter after multiple attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, [mangaId, chapterId, fetchChapterFn]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") nextPage();
      else if (event.key === "ArrowLeft") previousPage();
    },
    [nextPage, previousPage]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

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
