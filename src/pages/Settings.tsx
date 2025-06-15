import React, { useState } from 'react';
import axiosInstance, { getbackendUrl, setbackendUrl } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [customGateways, setCustomGateways] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('customIPFSGateways') || '[]');
    } catch {
      return [];
    }
  });
  const [newGateway, setNewGateway] = useState('');
  const [gatewayMessage, setGatewayMessage] = useState('');

  const [apiUrl, setApiUrl] = useState(() => getbackendUrl());
  const [apiUrlMessage, setApiUrlMessage] = useState('');

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axiosInstance.put('/user/profile/' + user?.userId, { email });
      setMessage('Email updated!');
    } catch {
      setError('Failed to update email.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      await axiosInstance.put('/user/change-password', {
        currentPassword,
        newPassword,
      });
      setMessage('Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    let gw = newGateway.trim();
    if (!gw.startsWith('http')) {
      setGatewayMessage('Gateway must start with http(s)');
      return;
    }
    if (!gw.endsWith('/')) {
      gw += '/';
    }
    if (customGateways.includes(gw)) {
      setGatewayMessage('Gateway already added');
      return;
    }
    const updated = [...customGateways, gw];
    setCustomGateways(updated);
    localStorage.setItem('customIPFSGateways', JSON.stringify(updated));
    setNewGateway('');
    setGatewayMessage('Gateway added!');
  };

  const handleRemoveGateway = (gw: string) => {
    const updated = customGateways.filter(g => g !== gw);
    setCustomGateways(updated);
    localStorage.setItem('customIPFSGateways', JSON.stringify(updated));
  };

  const handleApiUrlChange = (e: React.FormEvent) => {
    e.preventDefault();
    let url = apiUrl.trim();
    if (!url.startsWith('http')) {
      setApiUrlMessage('API URL must start with http(s)');
      return;
    }
    setbackendUrl(url);
    setApiUrlMessage('API URL updated!');
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Settings</h2>
        {/* --- API URL Settings --- */}
        <form onSubmit={handleApiUrlChange} className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Backend API URL</label>
          <input
            type="text"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-2"
            placeholder="http://localhost:3000/api"
          />
          <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded">Set API URL</button>
          {apiUrlMessage && <div className="text-green-600 mt-1">{apiUrlMessage}</div>}
        </form>
        { user && (
          <>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Update Email
          </button>
        </form>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Update Password
          </button>
        </form>
        </>
        )}
        {/* --- IPFS Gateway Management --- */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Custom IPFS Gateways</h3>
          <form onSubmit={handleAddGateway} className="flex gap-2 mb-2">
            <input
              type="text"
              value={newGateway}
              onChange={e => { setNewGateway(e.target.value); setGatewayMessage(''); }}
              placeholder="https://your-gateway.example.com/ipfs/"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Add</button>
          </form>
          {gatewayMessage && <div className="text-sm mb-2 text-green-700">{gatewayMessage}</div>}
          <ul className="space-y-2">
            {customGateways.length === 0 && <li className="text-gray-500 text-sm">No custom gateways added.</li>}
            {customGateways.map(gw => (
              <li key={gw} className="flex items-center gap-2">
                <span className="break-all flex-1">{gw}</span>
                <button type="button" onClick={() => handleRemoveGateway(gw)} className="text-red-600 hover:underline text-xs">Remove</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Settings;
