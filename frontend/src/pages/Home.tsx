import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { searchTitle, getRandomTitle } from "../api/jikan";
import type { TTitle } from "../types/titles";
import SearchBar from "../components/SearchBar";
import TitleCard from "../components/TitleCard";
import TopRatedTitle from "../components/TopRatedTitle";
import TitleRecommendations from "../components/TitleRecommendations";
import { useDebounce } from "../hooks/useDebounce";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [titleList, setTitleList] = useState<TTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    setSearchParams(query ? { q: query } : {});
  }, [query, setSearchParams]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setTitleList([]);
        return;
      }
      
      setLoading(true);
      try {
        const results = await searchTitle(debouncedQuery);
        setTitleList(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleRandomTitle = async () => {
    setLoading(true);
    try {
      const title = await getRandomTitle();
      navigate(`/titles/${title.mal_id}`);
    } catch (error) {
      console.error("Failed to get random title:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SearchBar 
        query={query}
        setQuery={setQuery}
        onRandomClick={handleRandomTitle}
        isLoading={loading}
      />

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      )}

      {query && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {titleList.map((title) => (
            <Link to={`/titles/${title.mal_id}`} key={title.mal_id}>
              <TitleCard title={title} />
            </Link>
          ))}
        </div>
      )}

      <TitleRecommendations/>
      <TopRatedTitle />
    </div>
  );
};

export default Home;