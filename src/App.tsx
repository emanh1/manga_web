import { useState } from "react";
import { searchManga } from "./api/jikan";
import MangaCard from "./components/MangaCard"; 
import type { Manga } from "./types/manga";

function App() {
  const [query, setQuery] = useState("");
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const results = await searchManga(query);
    setMangaList(results);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <form onSubmit={handleSearch} className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border p-2 rounded-l"
          placeholder="Search manga..."
        />
        <button className="bg-purple-600 text-white px-4 py-2 rounded-r" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mangaList.map((manga) => (
            <MangaCard key={manga.mal_id} manga={manga} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;

