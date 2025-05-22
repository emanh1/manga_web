import React, { useEffect, useState } from "react";
import { getTopManga } from "../api/jikan";
import type { Manga } from "../types/manga";
import MangaCard from "./MangaCard";
import { Link } from "react-router-dom";

const PopularManga: React.FC = () => {
  const [popular, setPopular] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPopular() {
      setLoading(true);
      try {
        const data = await getTopManga(8);
        setPopular(data);
      } catch {
        setPopular([]);
      }
      setLoading(false);
    }
    fetchPopular();
  }, []);

  if (loading) return <p>Loading popular manga...</p>;

  return (
    <section className="mt-6">
      <h2 className="text-2xl font-semibold mb-4">Popular Manga</h2>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {popular.map((manga) => (
            <Link to={`/manga/${manga.mal_id}`} key={manga.mal_id}>
              <MangaCard manga={manga} />
            </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularManga;
