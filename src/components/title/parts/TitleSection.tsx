import type { TTitle } from "@/types/titles";

export const TitleSection: React.FC<{ title: TTitle }> = ({ title }) => {
  const title_main = title.title?.trim() || "";
  const titleEnglish = title.title_english?.trim() || "";
  const titleJapanese = title.title_japanese?.trim() || "";
  const showEnglish = titleEnglish && (title_main.toLowerCase() !== titleEnglish.toLowerCase());

  return (
    <div>
      <h1 className="text-7xl font-bold">{title_main}</h1>
      {showEnglish ? (
        <div className="text-base text-gray-500 mt-1">{titleEnglish}</div>
      ) : titleJapanese && (
        <div className="text-base text-gray-500 mt-1">{titleJapanese}</div>
      )}
    </div>
  );
};