import React, { useRef } from "react";
import type { ReactNode } from "react";
import ScrollButtons from "./ScrollButtons";

interface MangaCardSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  scrollAmount?: number;
}

const MangaCardSection: React.FC<MangaCardSectionProps> = ({ title, children, className = "", scrollAmount }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="relative">
        <ScrollButtons scrollContainerRef={scrollContainerRef} scrollAmount={scrollAmount} />
        <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
          <div className="flex gap-4 w-max">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MangaCardSection;
