import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import ChatViewNew from './ChatViewNew';
import UserSearch from './UserSearch';
import { getUsersFromDB } from '../utils/mongoConstants';

export default function ChatDashboard({ currentUser, onLogout, onChangePassword, onStartChat }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Map()); // userId -> {isOnline, lastSeenText}
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadRecentChats();
    initializeSocket();
    
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
        console.log('Dashboard connected to socket server');
        const userId = currentUser.userId || currentUser.id;
        newSocket.emit('join-room', userId);
        
        // Request current online users
        newSocket.emit('get-online-users');
      });

      newSocket.on('user-online', (data) => {
        console.log('User came online:', data);
        setOnlineUsers(prev => new Map(prev.set(data.userId, {
          isOnline: true,
          lastSeenText: 'Online'
        })));
      });

      newSocket.on('user-offline', (data) => {
        console.log('User went offline:', data);
        setOnlineUsers(prev => new Map(prev.set(data.userId, {
          isOnline: false,
          lastSeenText: formatLastSeen(data.lastSeen)
        })));
      });

      newSocket.on('online-users', (users) => {
        console.log('Received real-time online users:', users);
        const onlineMap = new Map();
        users.forEach(user => {
          onlineMap.set(user.userId, {
            isOnline: user.isOnline,
            lastSeenText: user.isOnline ? 'Online' : formatLastSeen(user.lastSeen)
          });
        });
        setOnlineUsers(onlineMap);
        
        // Also check status for users in recent chats who might not be in the online list
        recentChats.forEach(chat => {
          if (!onlineMap.has(chat.userId)) {
            newSocket.emit('check-user-status', chat.userId);
          }
        });
      });

      // Handle individual user status responses
      newSocket.on('user-status-response', (data) => {
        console.log('Received user status response:', data);
        setOnlineUsers(prev => new Map(prev.set(data.userId, {
          isOnline: data.isOnline,
          lastSeenText: data.isOnline ? 'Online' : formatLastSeen(data.lastSeen)
        })));
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket:', error);
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

  const loadRecentChats = async () => {
    try {
      // Load recent chats from MongoDB user data or local storage as fallback
      // For now, we'll use a simple in-memory approach since chat history
      // would require additional backend implementation
      const recent = JSON.parse(localStorage.getItem(`recentChats_${currentUser.userId}`) || '[]');
      setRecentChats(recent);
      
      // After loading recent chats, check their online status if socket is available
      if (socket && recent.length > 0) {
        recent.forEach(chat => {
          socket.emit('check-user-status', chat.userId);
        });
      }
    } catch (error) {
      console.error('Error loading recent chats:', error);
      setRecentChats([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    // Add to recent chats (user-specific)
    const updatedRecent = [
      user,
      ...recentChats.filter(chat => chat.userId !== user.userId)
    ].slice(0, 10); // Keep only 10 recent chats
    
    setRecentChats(updatedRecent);
    // Store per-user recent chats to avoid conflicts
    localStorage.setItem(`recentChats_${currentUser.userId}`, JSON.stringify(updatedRecent));
    
    // Start real-time chat instead of using the old chat view
    if (onStartChat) {
      onStartChat(user);
    } else {
      setSelectedUser(user);
    }
  };

  if (selectedUser) {
    return (
      <ChatViewNew
        currentUser={currentUser}
        chatWith={selectedUser}
        onLogout={onLogout}
        onChangePassword={onChangePassword}
        onBack={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-flipkart-blue text-white px-4 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=ffffff&color=2874F0&size=40`}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
            <div>
              <h1 className="text-lg font-semibold">Stealth Chat</h1>
              <p className="text-sm text-blue-200">Welcome, {currentUser.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="hidden sm:inline">New Chat</span>
            </button>
            
            <button
              onClick={onChangePassword}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Change Password"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-6 6c-3 0-5.5-1.5-5.5-4a3.5 3.5 0 117 0 6 6 0 01-6 6 6 6 0 01-6-6c0-1 0-2 1-3a2 2 0 012-2z" />
              </svg>
            </button>
            
            <button
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat List Sidebar */}
        <div className="w-full max-w-md bg-white border-r border-gray-200">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowUserSearch(true)}
              className="w-full px-4 py-2 text-left text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search users to chat...
            </button>
          </div>

          {/* Recent Chats */}
          <div className="overflow-y-auto">
            {recentChats.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent chats</h3>
                <p className="text-gray-500 mb-4">Start a conversation by searching for users</p>
                <button
                  onClick={() => setShowUserSearch(true)}
                  className="bg-flipkart-blue text-white px-6 py-2 rounded-lg hover:bg-flipkart-blue-dark transition-colors"
                >
                  Find Users
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {recentChats.map((chat) => {
                  const userStatus = onlineUsers.get(chat.userId) || { isOnline: false, lastSeenText: 'Last seen a long time ago' };
                  return (
                    <button
                      key={chat.userId}
                      onClick={() => handleUserSelect(chat)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    >
                      <div className="relative">
                        <img
                          src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=2874F0&color=fff&size=40`}
                          alt={chat.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${userStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                        <p className="text-sm text-gray-500 truncate">
                          {userStatus.isOnline ? (
                            <span className="text-green-600 font-medium">Online</span>
                          ) : (
                            userStatus.lastSeenText
                          )}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Welcome Message */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-32 h-32 bg-flipkart-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Stealth Chat</h2>
            <p className="text-gray-600 mb-6">Select a user from the sidebar or start a new conversation</p>
            <button
              onClick={() => setShowUserSearch(true)}
              className="bg-flipkart-blue text-white px-6 py-3 rounded-lg hover:bg-flipkart-blue-dark transition-colors"
            >
              Start New Chat
            </button>
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          currentUser={currentUser}
          onSelectUser={handleUserSelect}
          onClose={() => setShowUserSearch(false)}
        />
      )}
    </div>
  );
}
