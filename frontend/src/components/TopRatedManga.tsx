import React, { useEffect, useState, useRef } from "react";
import { getTopManga } from "../api/jikan";
import type { TManga } from "../types/manga";
import MangaCard from "./MangaCard";
import { Link } from "react-router-dom";
import ScrollButtons from "./ScrollButtons";

const TopRatedManga: React.FC = () => {
  const [topRated, setTopRated] = useState<TManga[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Top Rated Manga</h2>
      <div className="relative">
        <ScrollButtons scrollContainerRef={scrollContainerRef} />
        <div className="overflow-x-auto pb-4" ref={scrollContainerRef}>
          <div className="flex gap-4 w-max">
            {topRated.map((manga) => (
              <div className="w-[250px] flex-shrink-0" key={manga.mal_id}>
                <Link to={`/manga/${manga.mal_id}`}>
                  <MangaCard manga={manga} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopRatedManga;
