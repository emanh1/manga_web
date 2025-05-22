import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import { searchManga } from "./api/jikan";
import MangaCard from "./components/MangaCard";
import MangaDetails from "./components/MangaDetails";
import PopularManga from "./components/PopularManga";
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
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Link to="/" className="text-xl font-bold text-purple-600">
              Manga Web
            </Link>
          </div>
        </nav>

        <Routes>
          <Route
            path="/"
            element={
              <div className="p-6 max-w-7xl mx-auto">
                <form onSubmit={handleSearch} className="flex mb-4">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="flex-1 border p-2 rounded-l"
                    placeholder="Search manga..."
                  />
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded-r"
                    type="submit"
                  >
                    Search
                  </button>
                </form>

                {loading && <div>Loading...</div>}

                {!query && <PopularManga />}

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
            }
          />
          <Route path="/manga/:id" element={<MangaDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
