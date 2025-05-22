import React from "react";
import type { TManga } from "../types/manga";

type Props = {
  manga: TManga;
};

const MangaCard: React.FC<Props> = ({ manga }) => (
  <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
    <img
      src={manga.images.jpg.image_url}
      alt={manga.title}
      className="w-full h-64 object-cover rounded"
      loading="lazy"
    />
    <h2 className="text-xl font-bold mt-2 text-purple-700">{manga.title}</h2>
    <p>{manga.published.prop.from.year}</p>
    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{manga.synopsis}</p>
  </div>
);

export default MangaCard;
