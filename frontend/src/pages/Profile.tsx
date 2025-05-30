import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, token } = useAuth();
  const { uuid } = useParams();
  const isOwnProfile = !uuid || uuid === (user as any)?.uuid;
  const [profile, setProfile] = useState<any>(null);
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const endpoint = `/user/profile/${uuid}`;
    axiosInstance.get(endpoint)
      .then(res => {
        setProfile(res.data);
        setBio(res.data.bio || '');
        setAvatarUrl(res.data.avatarUrl || '');
        setDisplayName(res.data.username || '');
      });
  }, [token, uuid]);

  const handleSave = async () => {
    try {
      const res = await axiosInstance.put(`/user/profile/${uuid}`, { bio, avatarUrl, displayName });
      setProfile(res.data.user);
      setEditing(false);
      setMessage('Profile updated!');
    } catch (e) {
      setMessage('Failed to update profile.');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>{isOwnProfile ? 'My Profile' : `${profile.username}'s Profile`}</h2>
      {message && <div>{message}</div>}
      <img src={avatarUrl || '/default-avatar.png'} alt="avatar" style={{ width: 100, height: 100, borderRadius: '50%' }} />
      <div>
        <label>Display Name:</label>
        {editing && isOwnProfile ? (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} />
        ) : (
          <span>{profile.username}</span>
        )}
      </div>
      <div>
        <label>Bio:</label>
        {editing && isOwnProfile ? (
          <textarea value={bio} onChange={e => setBio(e.target.value)} />
        ) : (
          <span>{profile.bio}</span>
        )}
      </div>
      <div>
        <label>Avatar URL:</label>
        {editing && isOwnProfile ? (
          <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
        ) : (
          <span>{profile.avatarUrl}</span>
        )}
      </div>
      {isOwnProfile && (editing ? (
        <button onClick={handleSave}>Save</button>
      ) : (
        <button onClick={() => setEditing(true)}>Edit Profile</button>
      ))}
    </div>
  );
};

export default Profile;
