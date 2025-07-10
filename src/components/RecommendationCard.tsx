import { Link } from "react-router-dom";
import { useTitleDetails } from '../hooks/useTitleDetails';
import type { TTitleRecommendation } from "../types/titles";
import TitleCard from "./TitleCard";
import { LoadingSpinner } from "./LoadingSpinner";

export const RecommendationCard: React.FC<{
  recommendation: TTitleRecommendation;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ recommendation, isExpanded, onToggle }) => {
  const { title: firstTitle, loading: loadingFirst } = useTitleDetails(recommendation.entry[0]?.mal_id);
  const { title: secondTitle, loading: loadingSecond } = useTitleDetails(recommendation.entry[1]?.mal_id);

  if (loadingFirst || loadingSecond || !firstTitle || !secondTitle) {
    return <LoadingSpinner/>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Link to={`/titles/${firstTitle.mal_id}`}>
            <TitleCard title={firstTitle} />
          </Link>
        </div>
        <div className="flex-1">
          <Link to={`/titles/${secondTitle.mal_id}`}>
            <TitleCard title={secondTitle} />
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