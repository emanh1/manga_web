import React, { useEffect, useState } from "react";
import { getMangaRecommendations } from "../api/jikan";
import type { TMangaRecommendation } from "../types/manga";
import { RecommendationCard } from "./RecommendationCard";
import MangaCardSection from "./MangaCardSection";

const MangaRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<TMangaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      setLoading(true);
      try {
        const data = await getMangaRecommendations(10);
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
    <MangaCardSection title="Recommended Manga" scrollAmount={1250}>
      {recommendations.map((rec) => (
        <div className="w-[600px] flex-shrink-0" key={rec.mal_id}>
          <RecommendationCard
            recommendation={rec}
            isExpanded={expandedId === rec.mal_id}
            onToggle={() => setExpandedId(expandedId === rec.mal_id ? null : rec.mal_id)}
          />
        </div>
      ))}
    </MangaCardSection>
  );
};

export default MangaRecommendations;