import React from "react";
import { useParams } from "react-router-dom";
import { titleAPI } from "../api/axios";
import { useChapterReader } from "../utils/useChapterReader";
import { toastUtil } from './toast';
import { useIPFSGateway } from '../contexts/IPFSGatewayContext';
import { LoadingSpinner } from './LoadingSpinner';
import { FaSyncAlt } from 'react-icons/fa';

const PRESET_GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://infura-ipfs.io/ipfs/"
];

const PreviewReader: React.FC = () => {
  const { titleId, chapterId } = useParams();
  const {
    chapter,
    pages,
    currentPage,
    setCurrentPage,
    loading,
    nextPage,
    previousPage,
  } = useChapterReader({
    titleId,
    chapterId,
    fetchChapterFn: titleAPI.previewChapter,
  });
  const [imgLoading, setImgLoading] = React.useState(true);
  const [imgKey, setImgKey] = React.useState(0);
  const [imgFailed, setImgFailed] = React.useState(false);
  const [retryIndex, setRetryIndex] = React.useState(0);
  const { gateway } = useIPFSGateway();

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
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
            <LoadingSpinner />
          </div>
        )}
        <img
          key={imgKey + '-' + retryIndex}
          src={(imgFailed && retryIndex < PRESET_GATEWAYS.length && gateway !== PRESET_GATEWAYS[retryIndex])
            ? PRESET_GATEWAYS[retryIndex] + pages[currentPage].filePath
            : gateway + pages[currentPage].filePath}
          alt={`Page ${currentPage + 1}`}
          className="max-h-[80vh] w-auto shadow-lg rounded"
          onLoad={() => {
            setImgLoading(false);
            setImgFailed(false);
            setRetryIndex(0);
          }}
          onError={() => {
            if (retryIndex < PRESET_GATEWAYS.length - 1) {
              setRetryIndex(retryIndex + 1);
              setImgLoading(true);
              toastUtil.error("Failed to load image. Retrying with alternate gateway...");
            } else {
              toastUtil.error("Image failed to load on all gateways");
              setImgLoading(false);
              setImgFailed(true);
            }
          }}
        />
        {imgFailed && (
          <button
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full p-3 shadow z-30 border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
            onClick={() => {
              setImgLoading(true);
              setImgKey((k) => k + 1);
              setImgFailed(false);
              setRetryIndex(0);
            }}
            title="Reload Image"
          >
            <FaSyncAlt className="text-xl text-gray-700" />
          </button>
        )}
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

