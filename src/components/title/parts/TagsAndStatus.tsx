import type { TMALEntity } from "@/types/titles";

export const TagsAndStatus: React.FC<{ title: any }> = ({ title }) => (
  <div className="mb-6 space-y-2">
    {/* Serializations */}
    {title.serializations.length > 0 && (
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-semibold">Serialization:</span>
        {title.serializations.map((s: TMALEntity) => (
          <span key={s.mal_id} className="inline-block text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 mr-1">{s.name}</span>
        ))}
      </div>
    )}
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Authors:</span>
      {title.authors.length > 0 ? (
        title.authors.map((a: TMALEntity, i: number) => (
          <span key={a.mal_id} className="inline-block text-sm bg-gray-200 rounded px-2 py-0.5 mr-1">
            {a.name}{i < title.authors.length - 1 ? ',' : ''}
          </span>
        ))
      ) : (
        <span className="text-gray-500">Unknown</span>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Demographic:</span>
      {title.demographics.length > 0 ? (
        title.demographics.map((d: TMALEntity) => (
          <span key={d.mal_id} className="inline-block text-xs bg-green-100 text-green-800 rounded px-2 py-0.5 mr-1">
            {d.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Genres:</span>
      {title.genres.length > 0 ? (
        title.genres.map((g: TMALEntity) => (
          <span key={g.mal_id} className="inline-block text-xs bg-gray-200 text-gray-800 rounded px-2 py-0.5 mr-1">
            {g.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Explicit Genres:</span>
      {title.explicit_genres.length > 0 ? (
        title.explicit_genres.map((g: TMALEntity) => (
          <span key={g.mal_id} className="inline-block text-xs bg-red-200 text-red-800 rounded px-2 py-0.5 mr-1">
            {g.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
    </div>
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-semibold">Themes:</span>
      {title.themes.length > 0 ? (
        title.themes.map((t: TMALEntity) => (
          <span key={t.mal_id} className="inline-block text-xs bg-purple-100 text-purple-800 rounded px-2 py-0.5 mr-1">
            {t.name}
          </span>
        ))
      ) : (
        <span className="text-gray-500">-</span>
      )}
    </div>
  </div>
);