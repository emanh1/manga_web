import React, { useEffect, useState } from "react";
import { getTopManga } from "../api/jikan";
import type { TManga } from "../types/manga";
import MangaCard from "./MangaCard";
import { Link } from "react-router-dom";
import MangaCardSection from "./MangaCardSection";

const TopRatedManga: React.FC = () => {
  const [topRated, setTopRated] = useState<TManga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRated() {
      setLoading(true);
      try {
        const data = await getTopManga(20);
        setTopRated(data);
      } catch {
        setTopRated([]);
      }
      setLoading(false);
    }
    fetchTopRated();
  }, []);

  if (loading) return <p>Loading top rated manga...</p>;

  return (
    <MangaCardSection title="Top Rated Manga">
      {topRated.map((manga) => (
        <div className="w-[250px] flex-shrink-0" key={manga.mal_id}>
          <Link to={`/manga/${manga.mal_id}`}>
            <MangaCard manga={manga} />
          </Link>
        </div>
      ))}
    </MangaCardSection>
  );
};

export default TopRatedManga;
