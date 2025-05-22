import React, { useState } from "react";
import { Link } from "react-router-dom";
import { searchManga } from "../api/jikan";
import type { TManga } from "../types/manga";
import SearchBar from "../components/SearchBar";
import MangaCard from "../components/MangaCard";
import TopRatedManga from "../components/TopRatedManga";

const Home: React.FC = () => {
  const [query, setQuery] = useState("");
  const [mangaList, setMangaList] = useState<TManga[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchManga(query);
    setMangaList(results);
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <SearchBar 
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
      />

      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
        </div>
      )}

      {!query && <TopRatedManga />}

      {query && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mangaList.map((manga) => (
            <Link to={`/manga/${manga.mal_id}`} key={manga.mal_id}>
              <MangaCard manga={manga} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;