import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchManga, getRandomManga } from "../api/jikan";
import type { TManga } from "../types/manga";
import SearchBar from "../components/SearchBar";
import MangaCard from "../components/MangaCard";
import TopRatedManga from "../components/TopRatedManga";
import MangaRecommendations from "../components/MangaRecommendations";
import { useDebounce } from "../hooks/useDebounce";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [mangaList, setMangaList] = useState<TManga[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setMangaList([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchManga(debouncedQuery);
        setMangaList(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleRandomManga = async () => {
    setLoading(true);
    try {
      const manga = await getRandomManga();
      navigate(`/manga/${manga.mal_id}`);
    } catch (error) {
      console.error("Failed to get random manga:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SearchBar 
        query={query}
        setQuery={setQuery}
        onRandomClick={handleRandomManga}
        isLoading={loading}
      />

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      )}

      {query && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mangaList.map((manga) => (
            <Link to={`/manga/${manga.mal_id}`} key={manga.mal_id}>
              <MangaCard manga={manga} />
            </Link>
          ))}
        </div>
      )}

      <MangaRecommendations/>
      <TopRatedManga />
    </div>
  );
};

export default Home;