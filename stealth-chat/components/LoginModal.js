import { useState } from 'react';
import { findUserByUsernameDB } from '../utils/mongoConstants';
import toast from 'react-hot-toast';

export default function LoginModal({ onClose, onLogin, onAdminAccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdmin) {
      // Admin access - only password required
      if (!password.trim()) {
        toast.error('Please enter admin password');
        return;
      }
    } else {
      // Regular user login - both username and password required
      if (!username.trim() || !password.trim()) {
        toast.error('Please enter both username and password');
        return;
      }
    }

    setLoading(true);

    try {
      if (isAdmin) {
        // Admin access
        const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
        if (password === ADMIN_PASSWORD) {
          onAdminAccess();
          onClose();
        } else {
          toast.error('Invalid admin password');
        }
      } else {
        // Regular user login - check user exists in DB first
        const user = await findUserByUsernameDB(username);
        if (!user) {
          toast.error('Username not found');
          return;
        }

        // Authenticate via API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            username: username, 
            password: password 
          })
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          
          onLogin({
            userId: data.user.userId,
            name: data.user.name,
            username: data.user.username,
            avatar: data.user.avatar
          });
          
          onClose();
          toast.success(`Welcome back, ${data.user.name}!`);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-flipkart-blue text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              {isAdmin ? 'Admin Access' : 'Login to Chat'}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 mt-2 text-sm">
            {isAdmin ? 'Enter admin password to access user management' : 'Enter your username and password to continue'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {!isAdmin && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flipkart-blue focus:border-transparent"
                disabled={loading}
              />
            </div>
          )}

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {isAdmin ? 'Admin Password' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`Enter your ${isAdmin ? 'admin ' : ''}password`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flipkart-blue focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Toggle Admin Mode */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => {
                  setIsAdmin(e.target.checked);
                  if (e.target.checked) {
                    setUsername(''); // Clear username when switching to admin mode
                  }
                }}
                className="rounded border-gray-300 text-flipkart-blue focus:ring-flipkart-blue"
                disabled={loading}
              />
              <span className="ml-2 text-sm text-gray-600">Admin Access</span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-flipkart-blue text-white hover:bg-flipkart-blue-dark rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logging in...
                </div>
              ) : (
                isAdmin ? 'Access Admin' : 'Login'
              )}
            </button>
          </div>
        </form>

        {/* Demo Users Info */}
        {!isAdmin && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-flipkart-blue mb-2">Demo Users Available:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>• Username: <code className="bg-gray-200 px-1 rounded">blueOcean42</code> | Password: <code className="bg-gray-200 px-1 rounded">blueOcean42</code></div>
                <div>• Username: <code className="bg-gray-200 px-1 rounded">silverMountain8</code> | Password: <code className="bg-gray-200 px-1 rounded">silverMountain8</code></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
