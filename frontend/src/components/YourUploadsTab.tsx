import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTitleDetails } from '../api/jikan';
import type { TTitle, TTitleChapter } from '../types/titles';
import axiosInstance from '../api/axios';

interface MangaWithChapters {
  title: TTitle;
  chapters: TTitleChapter[];
}

export default function YourUploadsTab({ uuid }: { uuid?: string }) {
  const [mangaList, setMangaList] = useState<MangaWithChapters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (!uuid) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/user/${uuid}/uploads`);
        const uploads = res.data.uploads;

        const grouped: { [key: number]: TTitleChapter[] } = {};

        for (const chap of uploads) {
          if (chap.malId && !grouped[chap.malId]) grouped[chap.malId] = [];

          if (chap.malId) {
            grouped[chap.malId].push(chap);
          }
        }

        const promises = Object.keys(grouped).map(async (key) => {
          const malId = Number(key);
          const title = await getTitleDetails(malId);
          return { title, chapters: grouped[malId] };
        });

        const results = await Promise.all(promises);
        setMangaList(results);
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch');
      } finally {
        setLoading(false);
      }
    })();
  }, [uuid]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (mangaList.length === 0) return <div>No uploads found.</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6">Your Manga</h2>
      <div className="space-y-6">
        {mangaList.map(({ title, chapters }) => (
          <div key={title.mal_id} className="bg-gray-50 p-4 rounded-md shadow flex">
            <img src={title.images.jpg.large_image_url} alt={title.title} className="w-32 mr-4 rounded-md object-cover" />

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">
                <Link to={`/titles/${title.mal_id}`}>{title.title}</Link>
              </h3>

              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 text-left">Volume</th>
                    <th className="px-2 py-1 text-left">Chapter</th>
                    <th className="px-2 py-1 text-left">Title</th>
                    <th className="px-2 py-1 text-left">Language</th>
                    <th className="px-2 py-1 text-left">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters?.map((chap) => (
                    <tr
                      key={chap.chapterId}
                      className="border-b last:border-0 transition hover:bg-gray-100"
                      onClick={() => navigate(`/titles/${title.mal_id}/${chap.chapterId}`)}
                    >
                      <td className="px-2 py-1">{chap.volume ?? '-'}</td>
                      <td className="px-2 py-1">{chap.chapterNumber ?? '-'}</td>
                      <td className="px-2 py-1">{chap.chapterTitle ?? '-'}</td>
                      <td className="px-2 py-1">{chap.language}</td>
                      <td className="px-2 py-1">
                        {new Date(chap.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}