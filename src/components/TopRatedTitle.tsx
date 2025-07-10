import React, { useEffect, useState } from "react";
import { getTopTitle } from "../api/jikan";
import type { TTitle } from "../types/titles";
import TitleCard from "./TitleCard";
import { Link } from "react-router-dom";
import TitleCardSection from "./TitleCardSection";
import { LoadingSpinner } from "./LoadingSpinner";

const TopRatedTitle: React.FC = () => {
  const [topRated, setTopRated] = useState<TTitle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTopRated() {
      setLoading(true);
      try {
        const data = await getTopTitle(20);
        setTopRated(data);
      } catch {
        setTopRated([]);
      }
      setLoading(false);
    }
    fetchTopRated();
  }, []);

  if (loading) return <LoadingSpinner/>;

  return (
    <TitleCardSection title="Top Rated Titles" linkTo="/titles/top">
      {topRated.map((title) => (
        <div className="w-[250px] flex-shrink-0" key={title.mal_id}>
          <Link to={`/titles/${title.mal_id}`}>
            <TitleCard title={title} />
          </Link>
        </div>
      ))}
    </TitleCardSection>
  );
};

export default TopRatedTitle;
