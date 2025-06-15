import React from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface ScrollButtonsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  scrollAmount?: number;
}

const ScrollButtons: React.FC<ScrollButtonsProps> = ({ scrollContainerRef, scrollAmount = 600 }) => {
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const newPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    container.scrollTo({ left: newPosition, behavior: 'smooth' });
  };

  return (
    <>
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-r-lg p-2 z-10"
        aria-label="Scroll left"
      >
        <HiChevronLeft className="w-6 h-6"/>
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg rounded-l-lg p-2 z-10"
        aria-label="Scroll right"
      >
        <HiChevronRight className="w-6 h-6"/>
      </button>
    </>
  );
};

export default ScrollButtons;
