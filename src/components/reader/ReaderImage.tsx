import React from "react";
import { LoadingSpinner } from "../LoadingSpinner";
import { useReaderContext } from './Context';

const ReaderImage: React.FC = () => {
  const {
    gateway,
    pages,
    currentPage,
    imageFit,
    imgLoading,
    setImgLoading,
    chapterList,
    chapterIndex,
    setCurrentPage,
  } = useReaderContext();
  if (!pages.length) return null;
  const src = gateway + pages[currentPage].filePath;
  const alt = `Page ${currentPage + 1}`;
  const canPrev = currentPage > 0 || (chapterIndex !== null && chapterIndex > 0);
  const canNext = currentPage < pages.length - 1 || (chapterIndex !== null && chapterIndex < chapterList.length - 1);
  const handlePrev = () => {
    setCurrentPage(Math.max(0, currentPage - 1));
  };
  const handleNext = () => {
    setCurrentPage(Math.min(pages.length - 1, currentPage + 1));
  };
  return (
    <div className="mb-6 relative w-full flex justify-center items-center" style={{ minHeight: '60vh' }}>
      {imgLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-20">
          <LoadingSpinner />
        </div>
      )}
      <img
        key={src}
        src={src}
        alt={alt}
        className={[
          'shadow-lg rounded transition-all duration-200',
          imageFit === 'fit-width' ? 'w-full h-auto max-h-[90vh]' : '',
          imageFit === 'fit-height' ? 'h-[90vh] w-auto max-w-full' : '',
          imageFit === 'fit-both' ? 'max-w-full max-h-[90vh] w-auto h-auto' : '',
          imageFit === 'no-limit' ? '' : '',
        ].join(' ')}
        style={imageFit === 'no-limit' ? { maxWidth: 'none', maxHeight: 'none', width: 'auto', height: 'auto' } : {}}
        onLoad={() => setImgLoading(false)}
        onError={() => setImgLoading(false)}
      />
      {/* Prev, next buttons */}
      <button
        className="absolute top-0 left-0 h-full w-1/2 cursor-pointer z-10"
        style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0)', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
        onClick={handlePrev}
        disabled={!canPrev}
        tabIndex={-1}
        aria-label="Previous page"
        type="button"
      />
      <button
        className="absolute top-0 right-0 h-full w-1/2 cursor-pointer z-10"
        style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0)', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
        onClick={handleNext}
        disabled={!canNext}
        tabIndex={-1}
        aria-label="Next page"
        type="button"
      />
    </div>
  );
};

export default ReaderImage;
