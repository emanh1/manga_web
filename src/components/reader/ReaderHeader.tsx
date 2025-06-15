import React from "react";
import { FaCog } from 'react-icons/fa';

interface ReaderHeaderProps {
  chapterNumber: number | string;
  chapterTitle: string;
  currentPage: number;
  totalPages: number;
  onMenuClick: () => void;
}

const ReaderHeader: React.FC<ReaderHeaderProps> = ({ chapterNumber, chapterTitle, currentPage, totalPages, onMenuClick }) => (
  <div className="mb-4 w-full flex flex-row items-center justify-between gap-4 px-4">
    <div className="text-lg font-semibold">
      {chapterTitle === 'Oneshot' ? (
        chapterTitle
      ) : (
        <>
          Chapter {chapterNumber}
          {chapterTitle && (
            <>
              {' '}- {chapterTitle}
            </>
          )}
        </>
      )}
    </div>
    <div className="text-sm text-gray-600">
      Page {currentPage + 1} / {totalPages}
    </div>
    <div className="flex items-center gap-2">
      <button
        className="bg-white border border-gray-300 rounded-full p-2 shadow hover:bg-gray-100 transition flex items-center"
        onClick={onMenuClick}
        title="Show Reader Menu"
      >
        <FaCog className="text-xl text-gray-700" />
      </button>
    </div>
  </div>
);

export default ReaderHeader;
