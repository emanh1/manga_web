import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMangaRecommendations } from "../api/jikan";
import type { TMangaRecommendation } from "../types/manga";

const MangaRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<TMangaRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.mal_id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-wrap gap-4 mb-4">
              {rec.entry.map((manga) => (
                <Link
                  key={manga.mal_id}
                  to={`/manga/${manga.mal_id}`}
                  className="flex-shrink-0 w-24"
                >
                  <img
                    src={manga.images.jpg.image_url}
                    alt={manga.title}
                    className="w-full h-32 object-cover rounded"
                    loading="lazy"
                  />
                  <p className="text-sm mt-1 text-gray-800 line-clamp-2">
                    {manga.title}
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-2">
              <p className="text-gray-600">{rec.content}</p>
              <p className="text-sm text-gray-500 mt-2">
                Recommended by{" "}
                <a
                  href={rec.user.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  {rec.user.username}
                </a>
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MangaRecommendations;