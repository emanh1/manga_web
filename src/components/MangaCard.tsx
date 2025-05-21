import React from "react";
import type { Manga } from "../types/manga";
type Props = {
  manga: Manga;
};

const MangaCard: React.FC<Props> = ({ manga }) => (
  <div className="border rounded-lg p-4 shadow-sm">
    <img src={manga.images.jpg.image_url} alt={manga.title} className="w-full h-64 object-cover rounded" />
    <h2 className="text-xl font-bold mt-2">{manga.title}</h2>
    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{manga.synopsis}</p>
  </div>
);

export default MangaCard;
