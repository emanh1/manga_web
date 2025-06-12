import React, { useEffect, useState } from "react";
import { getTitleRecommendations } from "../api/jikan";
import type { TTitleRecommendation } from "../types/titles";
import { RecommendationCard } from "./RecommendationCard";
import TitleCardSection from "./TitleCardSection";

const TitleRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<TTitleRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const data = await getTitleRecommendations(10);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations([]);
      }
      setLoading(false);
    }
    fetchRecommendations();
  }, []);

  if (loading) return <p>Loading recommendations...</p>;

  return (
    <TitleCardSection title="Recommended Titles" scrollAmount={1250}>
      {recommendations.map((rec) => (
        <div className="w-[600px] flex-shrink-0" key={rec.mal_id}>
          <RecommendationCard
            recommendation={rec}
            isExpanded={expandedId === rec.mal_id}
            onToggle={() => setExpandedId(expandedId === rec.mal_id ? null : rec.mal_id)}
          />
        </div>
      ))}
    </TitleCardSection>
  );
};

export default TitleRecommendations;