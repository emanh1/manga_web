import { Link } from "react-router-dom";
import { useMangaDetails } from '../hooks/useMangaDetails';
import type { TMangaRecommendation } from "../types/manga";
import MangaCard from "./MangaCard";

export const RecommendationCard: React.FC<{
  recommendation: TMangaRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ recommendation, isExpanded, onToggle }) => {
  const { manga: firstManga, loading: loadingFirst } = useMangaDetails(recommendation.entry[0]?.mal_id);
  const { manga: secondManga, loading: loadingSecond } = useMangaDetails(recommendation.entry[1]?.mal_id);

  if (loadingFirst || loadingSecond || !firstManga || !secondManga) {
    return <div className="bg-white p-4 rounded-lg shadow">Loading...</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Link to={`/manga/${firstManga.mal_id}`}>
            <MangaCard manga={firstManga} />
          </Link>
        </div>
        <div className="flex-1">
          <Link to={`/manga/${secondManga.mal_id}`}>
            <MangaCard manga={secondManga} />
          </Link>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 animate-fadeIn">
          <p className="text-gray-600">{recommendation.content}</p>
          <p className="text-sm text-gray-500 mt-2">
            Recommended by{" "}
            <a
              href={recommendation.user.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {recommendation.user.username}
            </a>
          </p>
        </div>
      )}

      <div className="text-center mt-4">
        <button
          className="text-purple-600 text-sm hover:underline"
          onClick={onToggle}
        >
          {isExpanded ? 'Show less' : 'Show details'}
        </button>
      </div>
    </div>
  );
};