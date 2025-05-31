import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { uploadAPI } from "../api/axios";
import { useChapterReader } from "../utils/useChapterReader";
import toast from 'react-hot-toast';
import { useIPFSGateway } from '../contexts/IPFSGatewayContext';
import GatewaySelector from "./GatewaySelector";
import { FaCog } from 'react-icons/fa';
import type { TMangaChapter } from "../types/manga";

const Reader: React.FC = () => {
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
    nextPage,
    previousPage,
  } = useChapterReader({
    mangaId,
    chapterId,
    fetchChapterFn: uploadAPI.getChapter,
  });
  const [imgLoading, setImgLoading] = React.useState(true);
  const [imgKey] = React.useState(0);
  const { gateway } = useIPFSGateway();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [chapterList, setChapterList] = React.useState<TMangaChapter[]>([]);
  const [chapterIndex, setChapterIndex] = React.useState<number | null>(null);

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

  if (loading || !chapter) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 flex flex-col gap-8 relative">
      <div className="flex-1 flex flex-row items-start gap-8">
        <div className="flex-1 flex flex-col items-center">
          <div className="mb-4 w-full flex flex-row items-center justify-between gap-4">
            <div className="text-lg font-semibold">
              Chapter {chapter.chapterNumber} - {chapter.chapterTitle}
            </div>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} / {pages.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition flex items-center"
                onClick={() => setSidebarOpen(true)}
                title="Show Reader Settings"
              >
                <FaCog className="text-xl text-gray-700" />
              </button>
            </div>
          </div>

          <div className="mb-6 relative w-full flex justify-center">
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
                <span className="text-gray-500">Loading image...</span>
              </div>
            )}
            <img
              key={imgKey}
              src={gateway + pages[currentPage].filePath}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[80vh] w-auto shadow-lg rounded"
              onLoad={() => setImgLoading(false)}
              onError={(e) => {
                const img = e.currentTarget;
                const alreadyRetried = img.dataset.retried === "true";
                if (!alreadyRetried) {
                  img.dataset.retried = "true";
                  img.src = img.src.replace(gateway.replace(/\/$/, ''), "https://cloudflare-ipfs.com/ipfs");
                  setImgLoading(true);
                  toast.error("Failed to load image. Retrying with alternate gateway...");
                } else {
                  toast.error("Image failed to load on both gateways");
                  setImgLoading(false);
                }
              }}
            />
            {/* <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded px-2 py-1 text-xs shadow z-30 border border-gray-300 hover:bg-gray-100"
              onClick={() => {
                setImgLoading(true);
                setImgKey((k) => k + 1);
              }}
            >
              Reload Image
            </button> */}
            <button
              className="absolute top-0 left-0 h-full w-1/2 cursor-pointer z-10"
              style={{ background: "rgba(0,0,0,0)", borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
              onClick={() => {
                if (currentPage === 0) {
                  if (chapterIndex !== null && chapterIndex > 0) {
                    const prev = chapterList[chapterIndex - 1];
                    navigate(`/manga/${mangaId}/${prev.chapterId}`);
                  }
                } else {
                  previousPage();
                }
              }}
              disabled={currentPage === 0 && (chapterIndex === null || chapterIndex <= 0)}
            />
            <button
              className="absolute top-0 right-0 h-full w-1/2 cursor-pointer z-10"
              style={{ background: "rgba(0,0,0,0)", borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
              onClick={() => {
                if (currentPage === pages.length - 1) {
                  if (
                    chapterIndex !== null &&
                    chapterIndex < chapterList.length - 1 &&
                    chapterIndex !== -1
                  ) {
                    const next = chapterList[chapterIndex + 1];
                    navigate(`/manga/${mangaId}/${next.chapterId}`);
                  }
                } else {
                  nextPage();
                }
              }}
              disabled={currentPage === pages.length - 1 && (chapterIndex === null || chapterIndex === chapterList.length - 1 || chapterIndex === -1)}
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
      {sidebarOpen && (
        <>
          <div
            className="absolute inset-0 bg-black bg-opacity-20 transition-opacity z-40"
            style={{ pointerEvents: 'auto' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
          <aside className="absolute right-0 top-0 h-full w-72 max-w-full bg-white rounded-r-lg shadow-lg p-4 flex flex-col gap-6 animate-fadeIn z-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Reader Settings</h2>
              <button
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => setSidebarOpen(false)}
                title="Hide Reader Settings"
              >
                <span className="text-xl">×</span>
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">IPFS Gateway</label>
              <GatewaySelector />
            </div>
          </aside>
        </>
      )}
    </div>
  );
};

export default Reader;

