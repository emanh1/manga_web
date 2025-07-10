import React from "react";
import { LoadingSpinner } from "../LoadingSpinner";

type ImageFit = 'no-limit' | 'fit-width' | 'fit-height' | 'fit-both';

interface ReaderImageProps {
  src: string;
  alt: string;
  imageFit: ImageFit;
  loading: boolean;
  onLoad: () => void;
  onError: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
}

const ReaderImage: React.FC<ReaderImageProps> = ({
  src,
  alt,
  imageFit,
  loading,
  onLoad,
  onError,
  onPrev,
  onNext,
  canPrev = false,
  canNext = false,
}) => (
  <div className="mb-6 relative w-full flex justify-center items-center" style={{ minHeight: '60vh' }}>
    {loading && (
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
      onLoad={onLoad}
      onError={onError}
    />
    {/* Prev, next buttons */}
    {onPrev && (
      <button
        className="absolute top-0 left-0 h-full w-1/2 cursor-pointer z-10"
        style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0)', borderTopLeftRadius: '0.5rem', borderBottomLeftRadius: '0.5rem' }}
        onClick={onPrev}
        disabled={!canPrev}
        tabIndex={-1}
        aria-label="Previous page"
        type="button"
      />
    )}
    {onNext && (
      <button
        className="absolute top-0 right-0 h-full w-1/2 cursor-pointer z-10"
        style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0)', borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem' }}
        onClick={onNext}
        disabled={!canNext}
        tabIndex={-1}
        aria-label="Next page"
        type="button"
      />
    )}
  </div>
);

export default ReaderImage;
