import React, { useEffect, useState } from "react";
import { getTopManga } from "../api/jikan";
import type { Manga } from "../types/manga";
import MangaCard from "./MangaCard";
import { Link } from "react-router-dom";

const TopRatedManga: React.FC = () => {
  const [topRated, setTopRated] = useState<Manga[]>([]);
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
    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Top Rated Manga</h2>
      <div className="relative">
        <div className="overflow-x-auto pb-4">
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
