import React from "react";
import type { TManga } from "../types/manga";

type Props = {
  manga: TManga;
};

const MangaCard: React.FC<Props> = ({ manga }) => (
  <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-[450px] flex flex-col">
    <div className="relative flex-shrink-0">
      <img
        src={manga.images.jpg.image_url}
        alt={manga.title}
        className="w-full h-64 object-cover rounded"
        loading="lazy"
      />
    </div>
    <div className="flex flex-col flex-grow">
      <h2 
      className="text-xl font-bold mt-2 text-purple-700 line-clamp-2" 
      title={manga.title}>
        {manga.title}
      </h2>
      <p>{manga.published.prop.from.year}</p>
      <p className="text-sm text-gray-600 mt-1 line-clamp-3 flex-grow">{manga.synopsis}</p>
    </div>
  </div>
);

export default MangaCard;
