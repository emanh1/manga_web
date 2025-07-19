
import React from "react";
import GatewaySelector from "../GatewaySelector";
import { useReaderContext } from './Context';

const ReaderMenu: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    chapterList,
    chapterIndex,
    chapterId,
    titleId,
    navigate,
    currentPage,
    setCurrentPage,
    pages,
    imageFit,
    setImageFit,
  } = useReaderContext();
  if (!sidebarOpen) return null;
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ pointerEvents: 'auto' }}
        onClick={() => setSidebarOpen(false)}
        aria-label="Close menu overlay"
      />
      <aside className="fixed right-0 top-0 h-full w-96 max-w-full bg-white shadow-2xl flex flex-col animate-slideIn z-50 border-l border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold tracking-tight">Menu</h2>
          <button
            className="ml-2 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={() => setSidebarOpen(false)}
            title="Hide Menu"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-8">
          {/* Chapter Navigation */}
          <section>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Chapter</label>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => {
                  if (chapterIndex !== null && chapterIndex > 0) {
                    const prev = chapterList[chapterIndex - 1];
                    navigate(`/titles/${titleId}/${prev.chapterId}`);
                  }
                }}
                disabled={chapterIndex === null || chapterIndex <= 0}
              >
                ←
              </button>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={chapterId}
                onChange={e => {
                  navigate(`/titles/${titleId}/${e.target.value}`);
                }}
              >
                {chapterList.map((c) => (
                  <option key={c.chapterId} value={c.chapterId}>
                    Chapter {c.chapterNumber} {c.chapterTitle ? `- ${c.chapterTitle}` : ''}
                  </option>
                ))}
              </select>
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => {
                  if (
                    chapterIndex !== null &&
                    chapterIndex < chapterList.length - 1 &&
                    chapterIndex !== -1
                  ) {
                    const next = chapterList[chapterIndex + 1];
                    navigate(`/titles/${titleId}/${next.chapterId}`);
                  }
                }}
                disabled={chapterIndex === null || chapterIndex === chapterList.length - 1 || chapterIndex === -1}
              >
                →
              </button>
            </div>
          </section>
          {/* Page Navigation */}
          <section>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Page</label>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ←
              </button>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={currentPage}
                onChange={e => setCurrentPage(Number(e.target.value))}
              >
                {pages.map((_, idx) => (
                  <option key={idx} value={idx}>
                    Page {idx + 1}
                  </option>
                ))}
              </select>
              <button
                className="px-2 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pages.length - 1}
              >
                →
              </button>
            </div>
          </section>
          {/* Gateway and Image Size Settings */}
          <section>
            <label className="block text-sm font-semibold mb-2 text-gray-700">IPFS Gateway</label>
            <GatewaySelector />
          </section>
          <section>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Image Size</label>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="imageFit"
                  value="no-limit"
                  checked={imageFit === 'no-limit'}
                  onChange={() => setImageFit('no-limit')}
                />
                No Limit
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="imageFit"
                  value="fit-width"
                  checked={imageFit === 'fit-width'}
                  onChange={() => setImageFit('fit-width')}
                />
                Fit Width
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="imageFit"
                  value="fit-height"
                  checked={imageFit === 'fit-height'}
                  onChange={() => setImageFit('fit-height')}
                />
                Fit Height
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="imageFit"
                  value="fit-both"
                  checked={imageFit === 'fit-both'}
                  onChange={() => setImageFit('fit-both')}
                />
                Fit Both
              </label>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
};

export default ReaderMenu;
