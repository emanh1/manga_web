import React from "react";
import type { TTitle } from "../types/titles";

type Props = {
  title: TTitle;
};

const TitleCard: React.FC<Props> = ({ title }) => (
  <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-[450px] flex flex-col">
    <div className="relative flex-shrink-0">
      <img
        src={title.images.jpg.image_url}
        alt={title.title}
        className="w-full h-64 object-cover rounded"
        loading="lazy"
      />
    </div>
    <div className="flex flex-col flex-grow">
      <h2 
      className="text-xl font-bold mt-2 text-purple-700 line-clamp-2" 
      title={title.title}>
        {title.title}
      </h2>
      <p>{title.published.prop.from.year}</p>
      <p className="text-sm text-gray-600 mt-1 line-clamp-3 flex-grow">{title.synopsis}</p>
    </div>
  </div>
);

export default TitleCard;
