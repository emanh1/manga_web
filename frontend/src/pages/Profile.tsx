import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useSearchParams } from 'react-router-dom';
import YourUploadsTab from '../components/YourUploadsTab';

interface ProfileData {
  uuid: string;
  username: string;
  bio: string;
  avatarUrl: string;
}

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const { uuid } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const isOwnProfile = !uuid || uuid === (user as any)?.uuid;
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'uploads'>(tabParam === 'uploads' ? 'uploads' : 'profile');

  useEffect(() => {
    const endpoint = `/user/${uuid}`;
    axiosInstance.get(endpoint)
      .then(res => {
        setProfile(res.data.user);
        setBio(res.data.user.bio || '');
        setAvatarUrl(res.data.user.avatarUrl || '');
        setUsername(res.data.user.username || '');
      });
  }, [token, uuid]);

  useEffect(() => {
    setSearchParams(tabParam === activeTab ? searchParams : { ...Object.fromEntries(searchParams.entries()), tab: activeTab });
  }, [activeTab]);

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put(`/user/${uuid}`, { bio, avatarUrl, username });
      setProfile(res.data.user);
      setEditing(false);
      setMessage('Profile updated!');
    } catch {
      setMessage('Failed to update profile.');
    }
  };

  if (!profile) return <div className="p-8 flex justify-center items-center min-h-[40vh]">Loading...</div>;

  return (
    <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-2xl flex flex-col items-center">
        <div className="w-full flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`ml-2 px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'uploads' ? 'border-purple-600 text-purple-700' : 'border-transparent text-gray-500 hover:text-purple-600'}`}
            onClick={() => setActiveTab('uploads')}
          >
            Uploads
          </button>
        </div>
        {activeTab === 'profile' && (
          <>
            <div className="relative mb-4">
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-200 shadow"
              />
              {isOwnProfile && editing && (
                <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow">
                  Editing
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">
              {isOwnProfile ? 'My Profile' : `${profile.username}'s Profile`}
            </h2>
            {message && <div className="mb-2 text-green-700 bg-green-50 px-3 py-1 rounded text-sm">{message}</div>}
            <div className="w-full space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                {editing && isOwnProfile ? (
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold">{profile.username}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                {editing && isOwnProfile ? (
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[60px]"
                    maxLength={500}
                  />
                ) : (
                  <div className="text-gray-700 whitespace-pre-line min-h-[32px]">{profile.bio || <span className='text-gray-400'>No bio yet.</span>}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                {editing && isOwnProfile ? (
                  <input
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                ) : (
                  <div className="text-gray-700 break-all">{profile.avatarUrl || <span className='text-gray-400'>No avatar set.</span>}</div>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div className="mt-6 w-full flex justify-center">
                {editing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => { setEditing(false); setMessage(''); setUsername(profile.username); setBio(profile.bio || ''); setAvatarUrl(profile.avatarUrl || ''); }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            )}
          </>
        )}
        {activeTab === 'uploads' && (
          <div className="w-full">
            <YourUploadsTab uuid={profile.uuid} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
