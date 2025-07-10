import React, { useRef, useEffect, useState } from "react";
import { getTopTitle } from "../api/jikan";
import type { TTitle } from "../types/titles";
import TitleCard from "../components/TitleCard";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";

const TopRatedTitlesPage: React.FC = () => {
  const [topRated, setTopRated] = useState<TTitle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  }
  const fetchedOnceRef = useRef(false);

  useEffect(() => {
    if (!fetchedOnceRef.current) {
      fetchedOnceRef.current = true;
      fetchTopRated(1);
    }
  }, []);


  const fetchTopRated = async (pageToFetch: number) => {
    setLoading(true);
    try {
      const data = await getTopTitle(20, pageToFetch);
      setTopRated((prev) => [...prev, ...data]);
      if (data.length < 20) setHasMore(false);
    } catch {
      setHasMore(false);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTopRated(nextPage);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Top Rated Manga</h1>
      <button onClick={handleGoBack} className="pb-5 hover:text-blue-700">Go back</button>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {topRated.map((title) => (
          <Link to={`/titles/${title.mal_id}`} key={title.mal_id}>
            <TitleCard title={title} />
          </Link>
        ))}
      </div>

      {loading && <LoadingSpinner/>}

      {!loading && hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Load More
          </button>
        </div>
      )}

      {!hasMore && !loading && (
        <p className="text-center mt-6 text-gray-500">No more titles to load.</p>
      )}
    </div>
  );
};

export default TopRatedTitlesPage;

