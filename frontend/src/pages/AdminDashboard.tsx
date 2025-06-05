import { useState } from 'react';
import ReviewUploadsPanel from '../components/ReviewUploadsPanel';

export default function AdminDashboard() {
  const [activePanel, setActivePanel] = useState<'review' | 'users'>('review');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="flex gap-8">
        <aside className="w-48">
          <nav className="flex flex-col gap-2">
            <button
              className={`text-left px-4 py-2 rounded ${activePanel === 'review' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setActivePanel('review')}
            >
              Review Uploads
            </button>
            <button
              className={`text-left px-4 py-2 rounded ${activePanel === 'users' ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}
              onClick={() => setActivePanel('users')}
              disabled
            >
              Manage Users
            </button>
          </nav>
        </aside>
        <main className="flex-1">
          {activePanel === 'review' && <ReviewUploadsPanel />}
          {activePanel === 'users' && (
            <div className="p-8 text-gray-500">User management coming soon...</div>
          )}
        </main>
      </div>
    </div>
  );
}
