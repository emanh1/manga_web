import { useState, useEffect } from 'react';
import { titleAPI } from '../api/axios';
import { toastUtil } from './toast';
import type { TTitle, TTitleChapter } from '../types/titles';
import { getTitleDetails } from '../api/jikan';
import { Link } from 'react-router';
import { LoadingSpinner } from './LoadingSpinner';

export default function ReviewUploadsPanel() {
  const [uploads, setUploads] = useState<TTitleChapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalUploadId, setModalUploadId] = useState<{ malId: number | null; chapterId: string | null }>({ malId: null, chapterId: null });
  const [rejectionReason, setRejectionReason] = useState('');
  const [view, setView] = useState<'pending' | 'rejected'>('pending');
  const [titleInfo, setTitleInfo] = useState<Record<number, TTitle>>({});

  useEffect(() => {
    view === 'pending' ? fetchPendingChapters() : fetchRejectedChapters();
  }, [view]);

  useEffect(() => {
    if (uploads.length > 0) {
      fetchTitleDetails(uploads);
    }
  }, [uploads]);

  async function fetchTitleDetails(chapters: TTitleChapter[]) {
    const newInfo: Record<number, TTitle> = { ...titleInfo };
    for (const upload of chapters) {
      const malId = upload.malId;
      if (malId && !newInfo[malId]) {
        try {
          newInfo[malId] = await getTitleDetails(malId);
        } catch {
          toastUtil.error(`Failed to fetch details for MAL ID ${malId}`);
        }
      }
    }
    setTitleInfo(newInfo);
  }

  async function fetchPendingChapters() {
    setIsLoading(true);
    try {
      const response = await titleAPI.getAllPendingChapters();
      setUploads(response.chapters || []);
    } catch {
      toastUtil.error('Failed to fetch pending chapters');
      setUploads([]);

    } finally {
      setIsLoading(false);
    }
  }

  async function fetchRejectedChapters() {
    setIsLoading(true);
    try {
      const response = await titleAPI.getAllRejectedChapters();
      setUploads(response.chapters || []);
    } catch {
      toastUtil.error('Failed to fetch rejected chapters');
      setUploads([]);

    } finally {
      setIsLoading(false);
    }
  }

  async function handleReviewChapter(
    malId: number,
    chapterId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ) {
    try {
      await titleAPI.reviewChapter(malId, chapterId, status, reason);
      toastUtil.success('Review submitted successfully');
      view === 'pending' ? fetchPendingChapters() : fetchRejectedChapters();
    } catch {
      toastUtil.error('Failed to submit review');
    }
  }

  function openRejectModal(malId: number, chapterId: string) {
    setModalUploadId({ malId, chapterId });
    setRejectionReason('');
    setShowModal(true);
  }

  function closeRejectModal() {
    setShowModal(false);
    setModalUploadId({ malId: null, chapterId: null });
    setRejectionReason('');
  }

  function submitRejection() {
    const { malId, chapterId } = modalUploadId;
    if (malId && chapterId) {
      handleReviewChapter(malId, chapterId, 'rejected', rejectionReason);
      closeRejectModal();
    }
  }

  if (isLoading) {
    return <LoadingSpinner/>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Review Title Uploads</h2>
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
        {uploads.map((upload) => {
          const title = titleInfo[upload.malId ?? -1];
          return (
            <div key={upload.chapterId} className="bg-white rounded-lg shadow p-6 flex gap-4">
              {title?.images?.jpg?.large_image_url && (
                <img
                  src={title.images.jpg.large_image_url}
                  alt={`Cover for ${title?.title}`}
                  className="w-24 h-36 object-cover rounded mr-4"
                />
              )}

              <div className="flex-1">
                <h3 className="text-lg font-semibold">{title?.title ?? 'Unknown Title'}</h3>
                <p className="text-gray-600">
                  Chapter: {upload.chapterNumber ?? ''} {upload.chapterTitle && `- ${upload.chapterTitle}`}
                </p>
                <p className="text-sm text-gray-500">
                  Uploaded by:{' '}
                  <Link to={`/profile/${upload.uploader?.userId}`} className="text-blue-600 hover:underline">
                    {upload.uploader?.username}
                  </Link>
                </p>
                <p className="text-sm text-gray-500">
                  Date:{' '}{new Date(upload.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Pages:{' '}{upload.pages?.length ?? 0}
                </p>

                <div className="flex items-center space-x-2 mt-2">
                  {upload.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleReviewChapter(upload.malId, upload.chapterId, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(upload.malId, upload.chapterId)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded ${upload.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                      {upload.status?.charAt(0).toUpperCase() + upload.status?.slice(1)}
                    </span>
                  )}

                  {upload.status === 'rejected' && upload.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600">
                      Reason: {upload.rejectionReason}
                    </p>
                  )}

                  <div className="mt-4">
                    <a
                      href={`/titles/${upload.malId}/${upload.chapterId}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline">
                      Preview Chapter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">
              Rejection Reason
            </h3>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="Enter rejection reason"
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Submit Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

