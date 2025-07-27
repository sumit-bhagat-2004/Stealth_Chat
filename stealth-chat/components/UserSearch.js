import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { getUsersFromDB } from '../utils/mongoConstants';

export default function UserSearch({ currentUser, onSelectUser, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState(new Map()); // userId -> {isOnline, lastSeenText}
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    initializeSocket();
    loadUsers();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser.userId]);

  const initializeSocket = async () => {
    try {
      await fetch('/api/socketio');
      const newSocket = io({
        path: '/api/socketio',
        forceNew: false,
        reconnection: true,
        timeout: 20000,
      });

      newSocket.on('connect', () => {
        console.log('UserSearch connected to socket server');
        // Don't join room here, just listen for status updates
      });

      // Handle real-time status updates
      newSocket.on('user-status-response', (data) => {
        console.log('UserSearch received user status:', data);
        setUserStatuses(prev => new Map(prev.set(data.userId, {
          isOnline: data.isOnline,
          lastSeenText: data.isOnline ? 'Online' : formatLastSeen(data.lastSeen)
        })));
      });

      newSocket.on('user-online', (data) => {
        console.log('UserSearch: User came online:', data);
        setUserStatuses(prev => new Map(prev.set(data.userId, {
          isOnline: true,
          lastSeenText: 'Online'
        })));
      });

      newSocket.on('user-offline', (data) => {
        console.log('UserSearch: User went offline:', data);
        setUserStatuses(prev => new Map(prev.set(data.userId, {
          isOnline: false,
          lastSeenText: formatLastSeen(data.lastSeen)
        })));
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing UserSearch socket:', error);
    }
  };

  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return 'Last seen a long time ago';
    
    const now = Date.now();
    const lastSeenTime = new Date(lastSeenDate).getTime();
    const diffMs = now - lastSeenTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Last seen just now';
    } else if (diffMinutes < 60) {
      return `Last seen ${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `Last seen ${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `Last seen ${diffDays}d ago`;
    } else {
      return `Last seen ${new Date(lastSeenDate).toLocaleDateString()}`;
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load users from MongoDB only
      const allUsers = await getUsersFromDB();
      const otherUsers = allUsers.filter(user => 
        (user.id || user._id) !== currentUser.userId
      );
      setUsers(otherUsers);
      setFilteredUsers(otherUsers);
      
      // Check real-time status for each user via Socket.IO
      if (socket && otherUsers.length > 0) {
        otherUsers.forEach(user => {
          const userId = user.id || user._id;
          socket.emit('check-user-status', userId);
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Trigger status checks when socket becomes available
  useEffect(() => {
    if (socket && users.length > 0) {
      users.forEach(user => {
        const userId = user.id || user._id;
        socket.emit('check-user-status', userId);
      });
    }
  }, [socket, users]);

  useEffect(() => {
    // Filter users based on search term
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        (user.displayName || user.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const handleUserSelect = (user) => {
    onSelectUser({
      userId: user.id || user._id,
      name: user.displayName || user.name,
      username: user.username,
      avatar: user.profileImage
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-flipkart-blue text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select User to Chat</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users by name or username..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-flipkart-blue focus:border-transparent"
            />
            <svg className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* User List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flipkart-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users from database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 mb-2">
                {searchTerm ? 'No users found' : 'No other users available'}
              </p>
              {searchTerm && (
                <p className="text-sm text-gray-400">
                  Try searching with a different term
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const userId = user.id || user._id;
                const userStatus = userStatuses.get(userId) || { isOnline: false, lastSeenText: 'Last seen a long time ago' };
                return (
                  <button
                    key={userId}
                    onClick={() => handleUserSelect(user)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <div className="relative">
                      <img
                        src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name)}&background=2874F0&color=fff&size=40`}
                        alt={user.displayName || user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${userStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{user.displayName || user.name}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {userStatus.isOnline ? (
                          <span className="text-green-600 font-medium">Online</span>
                        ) : (
                          userStatus.lastSeenText
                        )}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
