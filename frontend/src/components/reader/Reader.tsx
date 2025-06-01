import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { uploadAPI } from "../../api/axios";
import { useChapterReader } from "../../utils/useChapterReader";
import toast from 'react-hot-toast';
import ReaderHeader from "./ReaderHeader";
import ReaderImage from "./ReaderImage";
import ReaderMenu from "./ReaderMenu";
import { useIPFSGateway } from '../../contexts/IPFSGatewayContext';
import { IPFSGatewayProvider } from '../../contexts/IPFSGatewayContext';
import type { TMangaChapter } from "../../types/manga";

const ReaderContent: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const initialPage = pageParam ? Math.max(0, parseInt(pageParam)) : 0;
  const {
    chapter,
    pages,
    currentPage,
    setCurrentPage,
    loading,
  } = useChapterReader({
    mangaId,
    chapterId,
    fetchChapterFn: uploadAPI.getChapter,
  });
  const [imgLoading, setImgLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [chapterList, setChapterList] = React.useState<TMangaChapter[]>([]);
  const [chapterIndex, setChapterIndex] = React.useState<number | null>(null);
  const [imageFit, setImageFit] = React.useState<'no-limit' | 'fit-width' | 'fit-height' | 'fit-both'>('fit-both');
  const { gateway } = useIPFSGateway();

  React.useEffect(() => {
    if (!mangaId) return;
    uploadAPI.getChapters(mangaId).then((data) => {
      setChapterList(data.chapters || []);
    });
  }, [mangaId]);

  React.useEffect(() => {
    if (!chapterList.length || !chapterId) return;
    const idx = chapterList.findIndex((c) => c.chapterId === chapterId);
    setChapterIndex(idx);
  }, [chapterList, chapterId]);

  React.useEffect(() => {
    if (currentPage !== initialPage) {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        if (currentPage > 0) {
          params.set("page", String(currentPage));
        } else {
          params.delete("page");
        }
        return params;
      });
    }
  }, [currentPage, setSearchParams]);
  React.useEffect(() => {
    if (currentPage !== initialPage && pages.length > 0) {
      setCurrentPage(initialPage < pages.length ? initialPage : 0);
    }
  }, [pages.length]);

  React.useEffect(() => {
    setImgLoading(true);
  }, [currentPage]);

  if (loading || !chapter) return <div className="p-4">Loading...</div>;

  const handlePrev = () => {
    if (currentPage === 0 && chapterIndex !== null && chapterIndex > 0) {
      const prev = chapterList[chapterIndex - 1];
      navigate(`/manga/${mangaId}/${prev.chapterId}?page=${pages.length - 1}`);
    } else {
      setCurrentPage(Math.max(0, currentPage - 1));
    }
  };

  const handleNext = () => {
    if (currentPage === pages.length - 1 && chapterIndex !== null && chapterIndex < chapterList.length - 1) {
      const next = chapterList[chapterIndex + 1];
      navigate(`/manga/${mangaId}/${next.chapterId}?page=0`);
    } else {
      setCurrentPage(Math.min(pages.length - 1, currentPage + 1));
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col gap-8 bg-gray-50">
      <div className="flex-1 flex flex-row items-start gap-8 w-full">
        <div className="flex-1 flex flex-col items-center w-full">
          <ReaderHeader
            chapterNumber={chapter.chapterNumber ?? ''}
            chapterTitle={chapter.chapterTitle ?? ''}
            currentPage={currentPage}
            totalPages={pages.length}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <div className="relative w-full">
            <ReaderImage
              key={gateway + '-' + currentPage}
              src={gateway + pages[currentPage].filePath}
              alt={`Page ${currentPage + 1}`}
              imageFit={imageFit}
              loading={imgLoading}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                toast.error("Image failed to load.");
                setImgLoading(false);
              }}
              onPrev={handlePrev}
              onNext={handleNext}
              canPrev={currentPage > 0 || (chapterIndex !== null && chapterIndex > 0)}
              canNext={currentPage < pages.length - 1 || (chapterIndex !== null && chapterIndex < chapterList.length - 1)}
            />
          </div>
          <div className="w-full max-w-md flex flex-col items-center gap-4">
            <div className="flex w-full items-center gap-2 justify-between">
              <input
                type="range"
                min={0}
                max={pages.length - 1}
                value={currentPage}
                onChange={(e) => setCurrentPage(parseInt(e.target.value))}
                className="w-full mx-2"
              />
            </div>
          </div>
        </div>
      </div>
      <ReaderMenu
        sidebarOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        chapterList={chapterList}
        chapterIndex={chapterIndex}
        chapterId={chapterId}
        mangaId={mangaId}
        navigate={navigate}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pages={pages}
        imageFit={imageFit}
        setImageFit={setImageFit}
      />
    </div>
  );
};

const Reader: React.FC = () => (
  <IPFSGatewayProvider>
    <ReaderContent />
  </IPFSGatewayProvider>
);

export default Reader;

