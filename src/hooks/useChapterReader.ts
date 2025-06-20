import { useEffect, useState, useCallback } from "react";
import { retryOperation } from "../utils/retry";
import { toastUtil } from "../components/toast";
import type { TTitleChapter, TChapterPage } from "../types/titles";

interface UseChapterReaderOptions {
  titleId?: string;
  chapterId?: string;
  fetchChapterFn: (titleId: string, chapterId: string) => Promise<{ message: string; chapter: TTitleChapter }>;
}

export function useChapterReader({ titleId, chapterId, fetchChapterFn }: UseChapterReaderOptions) {
  const [chapter, setChapter] = useState<TTitleChapter | null>(null);
  const [pages, setPages] = useState<TChapterPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  }, [currentPage, pages.length]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const fetchChapter = async () => {
    if (!titleId || !chapterId) return;
    setLoading(true);
    try {
      const {chapter} = await retryOperation(
        () => fetchChapterFn(titleId, chapterId),
        3,
        1000
      );
      setChapter(chapter);
      setPages(chapter.pages ?? []);
      setCurrentPage(0);
    } catch {
      toastUtil.error("Failed to load chapter after multiple attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapter();
  }, [titleId, chapterId, fetchChapterFn]);

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
