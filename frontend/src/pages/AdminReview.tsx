import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface MangaUpload {
  id: number;
  title: string;
  chapter: string;
  filePath: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  uploader: {
    username: string;
  };
  createdAt: string;
}

export default function AdminReview() {
  const { token } = useAuth();
  const [uploads, setUploads] = useState<MangaUpload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/manga/uploads', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUploads(response.data);
    } catch (error) {
      toast.error('Failed to fetch uploads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: number, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      await axios.put(
        `http://localhost:3000/api/manga/review/${id}`,
        { status, rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted successfully');
      fetchUploads();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Review Manga Uploads</h2>
      <div className="grid gap-6">
        {uploads.map((upload) => (
          <div key={upload.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{upload.title}</h3>
                <p className="text-gray-600">Chapter: {upload.chapter}</p>
                <p className="text-sm text-gray-500">
                  Uploaded by: {upload.uploader.username}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(upload.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {upload.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleReview(upload.id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = window.prompt('Enter rejection reason:');
                        if (reason) {
                          handleReview(upload.id, 'rejected', reason);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <span className={`px-3 py-1 rounded ${
                    upload.status === 'approved' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                  </span>
                )}
              </div>
            </div>
            {upload.status === 'rejected' && upload.rejectionReason && (
              <p className="mt-2 text-sm text-red-600">
                Reason: {upload.rejectionReason}
              </p>
            )}
            <div className="mt-4">
              <a
                href={`http://ipfs.io/ipfs/${upload.filePath}`} //TODO implement other gateways
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                View File
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
