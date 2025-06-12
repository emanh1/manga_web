import React, { useRef } from "react";
import type { ReactNode } from "react";
import ScrollButtons from "./ScrollButtons";
import { Link } from "react-router-dom";

interface TitleCardSectionProps {
  title: ReactNode;
  children: ReactNode;
  className?: string;
  scrollAmount?: number;
  linkTo?: string;
}

const TitleCardSection: React.FC<TitleCardSectionProps> = ({ title, children, className = "", scrollAmount, linkTo }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{
      linkTo ? (
        <Link to={linkTo} className="hover:text-blue-600">{title}</Link>
      ) : (
      title)}</h2>
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

export default TitleCardSection;
