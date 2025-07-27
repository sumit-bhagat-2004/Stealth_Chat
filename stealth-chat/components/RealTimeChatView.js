import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

// Singleton socket instance to prevent multiple connections
let globalSocket = null;

const getSocket = () => {
  if (!globalSocket) {
    globalSocket = io({
      path: '/api/socketio',
      forceNew: true,
      reconnection: true,
      timeout: 20000,
    });
  }
  return globalSocket;
};

const RealTimeChatView = ({ currentUser, chatWith, onBack }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatWithOnlineStatus, setChatWithOnlineStatus] = useState({
    isOnline: false,
    lastSeenText: 'Last seen a long time ago'
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const initSocket = async () => {
      await fetch('/api/socketio');
      const socket = getSocket();
      
      // Remove existing listeners to prevent duplicates
      socket.removeAllListeners();
      
      socket.on('connect', () => {
        console.log('🔌 Connected to socket server');
        setIsConnected(true);
        const userId = currentUser.userId || currentUser.id;
        console.log('👤 Joining room for user:', userId);
        socket.emit('join-room', userId);
      });

      socket.on('new-message', (message) => {
        console.log('📨 Frontend received new-message:', message);
        setMessages(prev => {
          console.log('📋 Current messages before update:', prev.length);
          const updated = [...prev, message];
          console.log('📋 Messages after update:', updated.length);
          return updated;
        });
        
        // Mark message as delivered if it's not from current user
        if (message.senderId !== currentUser.userId && message.senderId !== currentUser.id) {
          socket.emit('message-delivered', { messageId: message._id, userId: currentUser.userId || currentUser.id });
        }
      });

      socket.on('message-sent', (message) => {
        console.log('✅ Frontend received message-sent:', message);
        setMessages(prev => {
          console.log('📋 Current messages before update:', prev.length);
          const updated = [...prev, message];
          console.log('📋 Messages after update:', updated.length);
          return updated;
        });
      });

      socket.on('message-delivered', (data) => {
        console.log('📬 Message delivered:', data);
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, delivered: true } : msg
        ));
      });

      socket.on('message-read', (data) => {
        console.log('👁️ Message read:', data);
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, read: true, delivered: true } : msg
        ));
      });

      socket.on('message-error', (error) => {
        console.log('❌ Frontend received message-error:', error);
        toast.error(error.error || 'Failed to send message');
      });

      socket.on('user-typing', (data) => {
        console.log('⌨️ Frontend received user-typing:', data);
        if (data.userId === (chatWith.userId || chatWith.id)) {
          setUserTyping(data.isTyping);
        }
      });

      socket.on('disconnect', () => {
        console.log('🔌 Disconnected from socket server');
        setIsConnected(false);
      });

      // Handle user online/offline status
      socket.on('user-online', (data) => {
        console.log('🟢 User came online:', data);
        if (data.userId === (chatWith.userId || chatWith.id)) {
          setChatWithOnlineStatus({
            isOnline: true,
            lastSeenText: 'Online'
          });
        }
      });

      socket.on('user-offline', (data) => {
        console.log('🔴 User went offline:', data);
        if (data.userId === (chatWith.userId || chatWith.id)) {
          setChatWithOnlineStatus({
            isOnline: false,
            lastSeenText: formatLastSeen(data.lastSeen)
          });
        }
      });

      // Handle real-time user status response
      socket.on('user-status-response', (data) => {
        console.log('📊 Received user status:', data);
        if (data.userId === (chatWith.userId || chatWith.id)) {
          setChatWithOnlineStatus({
            isOnline: data.isOnline,
            lastSeenText: data.isOnline ? 'Online' : formatLastSeen(data.lastSeen)
          });
        }
      });

      setSocket(socket);
    };

    initSocket();

    return () => {
      console.log('🧹 Cleaning up socket connection...');
      // Don't disconnect global socket, just remove listeners for this component
      if (socket) {
        socket.removeAllListeners('new-message');
        socket.removeAllListeners('message-sent');
        socket.removeAllListeners('message-error');
        socket.removeAllListeners('user-typing');
        socket.removeAllListeners('disconnect');
      }
    };
  }, [currentUser?.userId, chatWith?.userId]); // More specific dependencies

  // Load message history
  useEffect(() => {
    loadMessages();
  }, [currentUser, chatWith]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
    
    // Mark messages as read when they are visible
    if (socket && messages.length > 0) {
      const unreadMessages = messages.filter(msg => 
        msg.senderId !== currentUser.userId && 
        msg.senderId !== currentUser.id && 
        !msg.read
      );
      
      unreadMessages.forEach(message => {
        socket.emit('message-read', { 
          messageId: message._id, 
          userId: currentUser.userId || currentUser.id 
        });
      });
    }
  }, [messages, socket, currentUser]);

  // Check real-time online status for chat partner
  useEffect(() => {    
    if (chatWith && socket) {
      // Request real-time status from Socket.IO server
      const chatWithId = chatWith.userId || chatWith.id;
      console.log(`📊 Requesting real-time status for user: ${chatWithId}`);
      socket.emit('check-user-status', chatWithId);
    }
  }, [chatWith, socket]);

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
      return `Last seen ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return `Last seen ${new Date(lastSeenDate).toLocaleDateString()}`;
    }
  };

  const loadMessages = async () => {
    try {
      const currentUserId = currentUser.userId || currentUser.id;
      const otherUserId = chatWith.userId || chatWith.id;
      
      const response = await fetch(
        `/api/messages/get?currentUserId=${currentUserId}&otherUserId=${otherUserId}&limit=50`
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      senderId: currentUser.userId || currentUser.id,
      recipientId: chatWith.userId || chatWith.id,
      message: newMessage.trim(),
      messageType: 'text'
    };

    socket.emit('send-message', messageData);
    setNewMessage('');
    stopTyping();
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && socket) {
      setIsTyping(true);
      socket.emit('typing', {
        recipientId: chatWith.userId || chatWith.id,
        isTyping: true
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && socket) {
      setIsTyping(false);
      socket.emit('typing', {
        recipientId: chatWith.userId || chatWith.id,
        isTyping: false
      });
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !socket) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        const messageData = {
          senderId: currentUser.userId || currentUser.id,
          recipientId: chatWith.userId || chatWith.id,
          message: '',
          messageType: getFileType(file.type),
          fileUrl: data.url,
          fileName: file.name
        };

        socket.emit('send-message', messageData);
        toast.success('File uploaded successfully');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getFileType = (mimeType) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const renderMessage = (message) => {
    const isOwn = (message.senderId === (currentUser.userId || currentUser.id));
    
    return (
      <div
        key={message._id}
        className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwn
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-800 rounded-bl-none'
          }`}
        >
          {message.messageType === 'text' && (
            <p className="text-sm">{message.message}</p>
          )}
          
          {message.messageType === 'image' && (
            <div>
              {message.message && <p className="text-sm mb-2">{message.message}</p>}
              <img
                src={message.fileUrl}
                alt={message.fileName}
                className="max-w-full h-auto rounded cursor-pointer"
                onClick={() => window.open(message.fileUrl, '_blank')}
              />
            </div>
          )}
          
          {message.messageType === 'video' && (
            <div>
              {message.message && <p className="text-sm mb-2">{message.message}</p>}
              <video
                src={message.fileUrl}
                controls
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
          
          {message.messageType === 'audio' && (
            <div>
              {message.message && <p className="text-sm mb-2">{message.message}</p>}
              <audio src={message.fileUrl} controls className="w-full" />
            </div>
          )}
          
          {message.messageType === 'file' && (
            <div>
              {message.message && <p className="text-sm mb-2">{message.message}</p>}
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center space-x-2 ${isOwn ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">{message.fileName}</span>
              </a>
            </div>
          )}
          
          <p className={`text-xs mt-1 flex items-center justify-between ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {isOwn && (
              <div className="flex items-center ml-2">
                {/* Single tick for sent, double tick for delivered/read */}
                {!message.delivered && !message.read && (
                  <svg className="w-4 h-4 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                )}
                {(message.delivered || message.read) && (
                  <div className="flex -space-x-1">
                    <svg className={`w-4 h-4 ${message.read ? 'text-blue-300' : 'text-blue-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <svg className={`w-4 h-4 ${message.read ? 'text-blue-300' : 'text-blue-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </div>
            )}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {chatWith.avatar && (
            <img
              src={chatWith.avatar}
              alt={chatWith.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          
          <div>
            <h3 className="font-semibold">{chatWith.displayName || chatWith.name}</h3>
            {userTyping ? (
              <p className="text-sm text-blue-200">Typing...</p>
            ) : (
              <div className="flex items-center space-x-1 text-sm text-blue-200">
                <div className={`w-2 h-2 rounded-full ${chatWithOnlineStatus.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span>{chatWithOnlineStatus.lastSeenText}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        className={`flex-1 overflow-y-auto p-4 ${isDragOver ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10">
            <div className="text-center">
              <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-blue-600 font-semibold">Drop files here to upload</p>
            </div>
          </div>
        )}
        
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-gray-50 p-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            title="Upload file"
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onBlur={stopTyping}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={!newMessage.trim() || uploading}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default RealTimeChatView;
