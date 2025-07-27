import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import VoiceRecorder from './VoiceRecorder';
import FileUploader from './FileUploader';
import toast from 'react-hot-toast';

export default function ChatView({ currentUser, chatWith, onLogout, onChangePassword, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUploader, setShowFileUploader] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch messages on component mount and set up polling
  useEffect(() => {
    fetchMessages();
    
    // Set up polling for real-time updates (simple approach)
    const interval = setInterval(fetchMessages, 3000);
    
    return () => clearInterval(interval);
  }, [chatWith.userId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/get?otherUserId=${chatWith.userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (messageData) => {
    if (sending) return;

    try {
      setSending(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: chatWith.userId,
          ...messageData
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setInputValue('');
        scrollToBottom();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSendText = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage({
        message: inputValue.trim(),
        messageType: 'text'
      });
    }
  };

  const handleFileUpload = (fileData) => {
    sendMessage({
      message: `Sent ${fileData.fileName}`,
      messageType: fileData.fileType.startsWith('image/') ? 'image' : 'file',
      fileUrl: fileData.fileUrl,
      fileName: fileData.fileName
    });
    setShowFileUploader(false);
  };

  const handleVoiceRecord = (voiceData) => {
    sendMessage({
      message: 'Voice message',
      messageType: 'voice',
      fileUrl: voiceData.fileUrl,
      fileName: voiceData.fileName
    });
    setShowVoiceRecorder(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flipkart-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-flipkart-blue text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <img
            src={chatWith.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chatWith.name)}&background=ffffff&color=2874F0&size=40`}
            alt={chatWith.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          
          <div>
            <h1 className="font-semibold text-lg">{chatWith.name}</h1>
            <p className="text-sm text-blue-100">@{chatWith.username}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onChangePassword}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            title="Change Password"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </button>
          
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-500 mb-2">No messages yet</p>
            <p className="text-sm text-gray-400">Start the conversation by sending a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message._id}
              message={message}
              isSentByMe={message.isSentByMe}
              currentUser={currentUser}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendText} className="flex items-center gap-2">
          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => setShowFileUploader(true)}
            className="p-2 text-gray-500 hover:text-flipkart-blue hover:bg-gray-100 rounded-full transition-colors"
            title="Attach File"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a3 3 0 000 4.243"></path>
            </svg>
          </button>

          {/* Voice Recorder Button */}
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            className="p-2 text-gray-500 hover:text-flipkart-blue hover:bg-gray-100 rounded-full transition-colors"
            title="Voice Message"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-flipkart-blue focus:border-transparent"
            disabled={sending}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="p-2 bg-flipkart-blue text-white rounded-full hover:bg-flipkart-blue-dark disabled:bg-gray-300 transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>

      {/* Voice Recorder Modal */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onRecordingComplete={handleVoiceRecord}
          onClose={() => setShowVoiceRecorder(false)}
        />
      )}

      {/* File Uploader Modal */}
      {showFileUploader && (
        <FileUploader
          onUploadComplete={handleFileUpload}
          onClose={() => setShowFileUploader(false)}
        />
      )}
    </div>
  );
}
