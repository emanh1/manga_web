import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import type { MangaUploadChapter } from '../types/manga';

const Reader: React.FC = () => {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<MangaUploadChapter | null>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;

  useEffect(() => {
    const fetchChapter = async () => {
      if (!mangaId || !chapterId) return;
      
      setLoading(true);
      try {
        const response = await axiosInstance.get<MangaUploadChapter>(`/manga/${mangaId}/chapters/${chapterId}`);
        setChapter(response.data);
        
        const pagesResponse = await axiosInstance.get<string[]>(`/manga/${mangaId}/chapters/${chapterId}/pages`);
        setPages(pagesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch chapter:', error);
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          toast.error(`Failed to load chapter. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
          setTimeout(fetchChapter, RETRY_DELAY * (retryCount + 1));
        } else {
          toast.error('Failed to load chapter after multiple attempts');
          navigate(`/manga/${mangaId}`);
        }
        setLoading(false);
      }
    };

    fetchChapter();
  }, [mangaId, chapterId, navigate, retryCount]);

  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      nextPage();
    } else if (event.key === 'ArrowLeft') {
      previousPage();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, pages.length]);

  const previousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!chapter || pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Chapter not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="fixed top-0 left-0 right-0 bg-gray-800 p-4 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate(`/manga/${mangaId}`)}
            className="text-white hover:text-gray-300"
          >
            ← Back to Manga
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">
              {chapter.title}
              {chapter.chapter && ` - Chapter ${chapter.chapter}`}
              {chapter.chapterTitle && `: ${chapter.chapterTitle}`}
            </h1>
            <div className="text-sm text-gray-400">
              Page {currentPage + 1} of {pages.length}
            </div>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <div 
            className="relative min-h-[70vh] flex items-center justify-center cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) {
                previousPage();
              } else {
                nextPage();
              }
            }}
          >
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[80vh] w-auto shadow-lg"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.dataset.retried) {
                  img.dataset.retried = 'true';
                  img.src = pages[currentPage].replace('ipfs.io', 'cloudflare-ipfs.com');
                }
                toast.error('Failed to load image. Retrying with alternate gateway...');
              }}
            />
            
            <div className="absolute inset-0 flex justify-between items-center opacity-0 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  previousPage();
                }}
                className="p-4 m-4 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75"
                disabled={currentPage === 0}
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextPage();
                }}
                className="p-4 m-4 bg-gray-800 bg-opacity-50 rounded-full hover:bg-opacity-75"
                disabled={currentPage === pages.length - 1}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TODO: partition page slider*/}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <input
            type="range"
            min={0}
            max={pages.length - 1}
            value={currentPage}
            onChange={(e) => setCurrentPage(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Reader;
