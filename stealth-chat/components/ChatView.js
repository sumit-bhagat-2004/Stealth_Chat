import { useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Message from './Message';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import { generateRoomId, debounce } from '../utils/helpers';
import { SOCKET_EVENTS, MESSAGE_TYPES } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ChatView({ currentUser, chatWith, onLogout, onChangePassword, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const roomId = generateRoomId(currentUser.userId, chatWith.userId);

  // Initialize socket connection and fetch messages
  useEffect(() => {
    initializeSocket();
    fetchMessages();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initializeSocket = async () => {
    try {
      // Initialize Socket.IO server
      await fetch('/api/socket');
      
      const token = localStorage.getItem('token');
      const newSocket = io({
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        newSocket.emit(SOCKET_EVENTS.JOIN_ROOM, roomId);
      });

      newSocket.on(SOCKET_EVENTS.RECEIVE_MESSAGE, (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      newSocket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
        if (data.userId !== currentUser.userId) {
          setOtherUserTyping(true);
        }
      });

      newSocket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, (data) => {
        if (data.userId !== currentUser.userId) {
          setOtherUserTyping(false);
        }
      });

      newSocket.on(SOCKET_EVENTS.USER_ONLINE, (data) => {
        if (data.userId === chatWith.userId) {
          setIsOnline(true);
        }
      });

      newSocket.on(SOCKET_EVENTS.USER_OFFLINE, (data) => {
        if (data.userId === chatWith.userId) {
          setIsOnline(false);
        }
      });

      newSocket.on('error', (error) => {
        toast.error('Connection error: ' + error.message);
      });

      setSocket(newSocket);
    } catch (error) {
      console.error('Socket initialization error:', error);
      toast.error('Failed to initialize chat connection');
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/chat/messages?otherUserId=${chatWith.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content, type = MESSAGE_TYPES.TEXT, fileData = null) => {
    if (!content.trim() && !fileData) return;

    const messageData = {
      roomId,
      recipientId: chatWith.userId,
      content: content.trim(),
      type,
      ...(fileData && {
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize
      })
    };

    // Send via socket for real-time delivery
    if (socket) {
      socket.emit(SOCKET_EVENTS.SEND_MESSAGE, messageData);
    }

    // Also save to database via API
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue, MESSAGE_TYPES.TEXT);
      setInputValue('');
      handleStopTyping();
    }
  };

  const handleFileSelect = (fileData) => {
    sendMessage('', fileData.messageType, fileData);
    toast.success('File sent successfully!');
  };

  const handleVoiceRecording = async (recordingData) => {
    try {
      // Convert blob to file for upload
      const file = new File([recordingData.blob], `voice_${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        await sendMessage('Voice message', MESSAGE_TYPES.VOICE, result);
        toast.success('Voice message sent!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Voice message error:', error);
      toast.error('Failed to send voice message');
    }
  };

  // Typing indicators with debounce
  const debouncedStopTyping = debounce(() => {
    if (socket && isTyping) {
      socket.emit(SOCKET_EVENTS.USER_STOPPED_TYPING, { roomId });
      setIsTyping(false);
    }
  }, 1000);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    
    if (!isTyping && socket) {
      socket.emit(SOCKET_EVENTS.USER_TYPING, { roomId });
      setIsTyping(true);
    }
    
    debouncedStopTyping();
  };

  const handleStopTyping = () => {
    if (socket && isTyping) {
      socket.emit(SOCKET_EVENTS.USER_STOPPED_TYPING, { roomId });
      setIsTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-chat-bg">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-whatsapp-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-chat-bg">
      {/* Chat Header */}
      <header className="bg-flipkart-blue text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              title="Back to Chat List"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <img
            src={chatWith.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatWith.name)}&background=ffffff&color=2874F0&size=40`}
            alt={chatWith.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div>
            <h2 className="font-semibold text-lg">{chatWith.name}</h2>
            <p className="text-xs text-blue-200">
              {isOnline ? 'online' : 'offline'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
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
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Start your conversation!</p>
              <p className="text-sm">Your messages are encrypted and secure.</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <Message
                key={message._id || index}
                message={message}
                isOwn={message.sender === currentUser.userId}
                senderName={message.sender === currentUser.userId ? currentUser.name : chatWith.name}
                senderAvatar={message.sender === currentUser.userId ? currentUser.avatar : chatWith.avatar}
              />
            ))}
            
            {otherUserTyping && (
              <div className="flex justify-start mb-4">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dots"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dots" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce-dots" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{chatWith.name} is typing...</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white px-4 py-3 border-t">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <FileUploader onFileSelect={handleFileSelect} />
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleStopTyping}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent"
              autoComplete="off"
            />
          </div>

          <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
          
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className={`p-2 rounded-full transition-colors ${
              inputValue.trim()
                ? 'bg-whatsapp-green text-white hover:bg-whatsapp-green-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
