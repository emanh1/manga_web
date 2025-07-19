import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { titleAPI } from "../../api/axios";
import { useChapterReader } from "../../hooks/useChapterReader";
import ReaderHeader from "./ReaderHeader";
import ReaderImage from "./ReaderImage";
import ReaderMenu from "./ReaderMenu";
import { ReaderContext } from "./Context";
import { useIPFSGateway } from '../../contexts/IPFSGatewayContext';
import { IPFSGatewayProvider } from '../../contexts/IPFSGatewayContext';
import type { TTitleChapter } from "../../types/titles";

const ReaderContent: React.FC = () => {
  const { titleId, chapterId } = useParams();
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
    titleId,
    chapterId,
    fetchChapterFn: titleAPI.getChapter,
  });
  const [imgLoading, setImgLoading] = React.useState(true);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [chapterList, setChapterList] = React.useState<TTitleChapter[]>([]);
  const [chapterIndex, setChapterIndex] = React.useState<number | null>(null);
  const [imageFit, setImageFit] = React.useState<'no-limit' | 'fit-width' | 'fit-height' | 'fit-both'>('fit-both');
  const { gateway } = useIPFSGateway();

  React.useEffect(() => {
    if (!titleId) return;
    titleAPI.getChapters(titleId).then((data) => {
      setChapterList(data.chapters || []);
    });
  }, [titleId]);

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



  return (
    <ReaderContext.Provider value={{
      chapter,
      pages,
      currentPage,
      setCurrentPage,
      loading,
      imgLoading,
      setImgLoading,
      sidebarOpen,
      setSidebarOpen,
      chapterList,
      chapterIndex,
      setChapterIndex,
      imageFit,
      setImageFit,
      gateway,
      titleId,
      chapterId,
      navigate,
    }}>
      <div className="relative min-h-screen flex flex-col gap-8 bg-gray-50">
        <div className="flex-1 flex flex-row items-start gap-8 w-full">
          <div className="flex-1 flex flex-col items-center w-full">
            <ReaderHeader />
            <div className="relative w-full">
              <ReaderImage />
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
        <ReaderMenu />
      </div>
    </ReaderContext.Provider>
  );
};

const Reader: React.FC = () => (
  <IPFSGatewayProvider>
    <ReaderContent />
  </IPFSGatewayProvider>
);

export default Reader;

