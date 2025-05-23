import React, { useEffect, useState, useRef } from "react";
import { getMangaRecommendations } from "../api/jikan";
import type { TMangaRecommendation } from "../types/manga";
import { RecommendationCard } from "./RecommendationCard";
import ScrollButtons from "./ScrollButtons";

const MangaRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<TMangaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <section className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">Recommended Manga</h2>
      <div className="relative">
        <ScrollButtons scrollContainerRef={scrollContainerRef} scrollAmount={1250} />
        <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
          <div className="flex gap-4 w-max">
            {recommendations.map((rec) => (
              <div className="w-[600px] flex-shrink-0" key={rec.mal_id}>
                <RecommendationCard
                  recommendation={rec}
                  isExpanded={expandedId === rec.mal_id}
                  onToggle={() => setExpandedId(expandedId === rec.mal_id ? null : rec.mal_id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MangaRecommendations;