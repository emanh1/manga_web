import { useState, useEffect } from 'react';
import { uploadAPI } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { type TMangaChapter } from '../types/manga';

export default function AdminReview() {
  const { token } = useAuth();
  const [uploads, setUploads] = useState<TMangaChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalUploadId, setModalUploadId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [view, setView] = useState<'pending' | 'rejected'>('pending');

  useEffect(() => {
    if (view === 'pending') fetchPendingChapters();
    else fetchRejectedChapters();
  }, [view]);

  const fetchPendingChapters = async () => {
    setIsLoading(true);
    try {
      const response = await uploadAPI.getAllPendingChapters();
      setUploads(response.chapters || []);
    } catch (error) {
      toast.error('Failed to fetch pending chapters');
      setUploads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRejectedChapters = async () => {
    setIsLoading(true);
    try {
      const response = await uploadAPI.getAllRejectedChapters();
      setUploads(response.chapters || []);
    } catch (error) {
      toast.error('Failed to fetch rejected chapters');
      setUploads([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await uploadAPI.reviewChapter(id, status, reason, token || undefined);
      toast.success('Review submitted successfully');
      if (view === 'pending') fetchPendingChapters();
      else fetchRejectedChapters();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  const openRejectModal = (id: number) => {
    setModalUploadId(id);
    setRejectionReason('');
    setShowModal(true);
  };

  const closeRejectModal = () => {
    setShowModal(false);
    setModalUploadId(null);
    setRejectionReason('');
  };

  const submitRejection = () => {
    if (modalUploadId !== null) {
      handleReview(modalUploadId, 'rejected', rejectionReason);
      closeRejectModal();
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Review Manga Uploads</h2>
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${view === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setView('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'rejected' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setView('rejected')}
        >
          Rejected
        </button>
      </div>
      <div className="grid gap-6">
        {uploads.map((upload) => (
          <div key={upload.chapterId} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{upload.title}</h3>
                <p className="text-gray-600">Chapter: {upload.chapter}</p>
                <p className="text-sm text-gray-500">
                  Uploaded by: {upload.uploader.username}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(upload.createdAt ?? upload.uploadedAt ?? '').toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Pages: {upload.pages?.length ?? 0}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {upload.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => handleReview(upload.pages![0].id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(upload.pages![0].id)}
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
            <div className="mt-4 flex gap-4">
              <a
                href={`http://ipfs.io/ipfs/${upload.pages![0].filePath}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800"
              >
                View First Page
              </a>
              <a
                href={`/manga/${upload.malId || 'unknown'}/${upload.chapterId}`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Preview Chapter
              </a>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Rejection Reason</h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              rows={3}
              placeholder="Enter rejection reason"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
