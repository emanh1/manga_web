import { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { Link } from 'react-router-dom';
import type { TTitleChapter } from '../types/titles';

interface UserTitle {
  malId: number;
  title: string;
  chapters: TTitleChapter[];
}

interface YourUploadsTabProps {
  uuid?: string;
}

export default function YourUploadsTab({ uuid }: YourUploadsTabProps) {
  const [uploads, setUploads] = useState<UserTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(uuid ? `/user/uploads/${uuid}` : '/user/uploads');
        setUploads(res.data.uploads);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch uploads');
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, [uuid]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  if (uploads.length === 0) {
    return <div className="p-8 text-center">No uploads found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6">Uploads</h2>
      <div className="space-y-8">
        {uploads.map(title => (
          <div key={title.malId} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center mb-2">
              <h3 className="text-lg font-semibold flex-1">
                <Link to={`/titles/${title.malId}`}>{title.title}</Link>
              </h3>
            </div>
            <div className="overflow-x-auto">
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
                  {title.chapters.map(chap => (
                    <tr
                      key={chap.chapterId}
                      className="border-b last:border-0 cursor-pointer hover:bg-purple-50 transition"
                      onClick={() => window.location.href = `/titles/${title.malId}/${chap.chapterId}`}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = `/titles/${title.malId}/${chap.chapterId}`; }}
                      aria-label={`Go to chapter ${chap.chapterNumber ?? ''} ${chap.chapterTitle ?? ''}`}
                    >
                      <td className="px-2 py-1">{chap.volume ?? '-'}</td>
                      <td className="px-2 py-1">{chap.chapterNumber ?? '-'}</td>
                      <td className="px-2 py-1">{chap.chapterTitle ?? '-'}</td>
                      <td className="px-2 py-1">{chap.language}</td>
                      <td className="px-2 py-1">{new Date(chap.uploadedAt).toLocaleString()}</td>
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
