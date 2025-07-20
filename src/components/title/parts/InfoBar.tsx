import type { TMALEntity } from "@/types/titles";

export const InfoBar: React.FC<{ title: any }> = ({ title }) => (
  <div className="flex flex-wrap gap-2 items-center mt-4">
    {title.genres.length > 0 ? (
      title.genres.map((g: TMALEntity) => (
        <span key={g.mal_id} className="inline-block text-xs bg-gray-200 text-gray-800 rounded px-2 py-0.5 mr-1">
          {g.name}
        </span>
      ))
    ) : (
      <span className="text-gray-500">-</span>
    )}
    {title.themes.length > 0 ? (
      title.themes.map((t: TMALEntity) => (
        <span key={t.mal_id} className="inline-block text-xs bg-purple-100 text-purple-800 rounded px-2 py-0.5 mr-1">
          {t.name}
        </span>
      ))
    ) : (
      <span className="text-gray-500">-</span>
    )}

    <span className="font-semibold">Publication:</span>
    <span className="flex items-center gap-1">
      <span
        className={`inline-block w-3 h-3 rounded-full ${title.status === 'Publishing' ? 'bg-green-500' : 'bg-blue-400'}`}
      ></span>
      <span className="text-xs text-gray-700">{title.status}</span>
    </span>
  </div>
);