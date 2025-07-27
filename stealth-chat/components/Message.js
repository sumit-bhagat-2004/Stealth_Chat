import { formatMessageTime, formatFileSize } from '../utils/helpers';
import { MESSAGE_TYPES } from '../utils/constants';

export default function Message({ message, isOwn, senderName, senderAvatar }) {
  const renderMessageContent = () => {
    switch (message.type) {
      case MESSAGE_TYPES.IMAGE:
        return (
          <div className="max-w-xs">
            <img
              src={message.fileUrl}
              alt={message.fileName}
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case MESSAGE_TYPES.VIDEO:
        return (
          <div className="max-w-xs">
            <video
              src={message.fileUrl}
              controls
              className="rounded-lg max-w-full h-auto"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );

      case MESSAGE_TYPES.AUDIO:
      case MESSAGE_TYPES.VOICE:
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"></path>
              </svg>
            </div>
            <audio
              src={message.fileUrl}
              controls
              className="flex-grow"
              preload="metadata"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      case MESSAGE_TYPES.DOCUMENT:
        return (
          <div 
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors max-w-xs"
            onClick={() => window.open(message.fileUrl, '_blank')}
          >
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="flex-grow min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{message.fileName}</p>
              <p className="text-xs text-gray-500">{formatFileSize(message.fileSize)}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        );

      case MESSAGE_TYPES.TEXT:
      default:
        return (
          <div>
            {/* Handle URLs in text messages */}
            {message.content.split(' ').map((word, index) => {
              if (word.startsWith('http://') || word.startsWith('https://')) {
                return (
                  <a
                    key={index}
                    href={word}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline hover:text-blue-600"
                  >
                    {word}{' '}
                  </a>
                );
              }
              return word + ' ';
            })}
          </div>
        );
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwn && (
          <div className="flex-shrink-0">
            <img
              src={senderAvatar || `https://via.placeholder.com/32/3B82F6/FFFFFF?text=${senderName?.[0] || 'U'}`}
              alt={senderName}
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
        
        <div className={`
          px-4 py-2 rounded-lg relative
          ${isOwn 
            ? 'bg-chat-sent text-gray-800' 
            : 'bg-chat-received text-gray-800 shadow-sm'
          }
        `}>
          {!isOwn && (
            <p className="text-xs font-medium text-gray-600 mb-1">{senderName}</p>
          )}
          
          <div className="message-content">
            {renderMessageContent()}
          </div>
          
          <div className={`text-xs text-gray-500 mt-1 flex items-center gap-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span>{formatMessageTime(message.timestamp)}</span>
            {isOwn && (
              <div className="flex items-center">
                {/* Single tick for sent, double tick for delivered/read */}
                {!message.delivered && !message.read && (
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                )}
                {(message.delivered || message.read) && (
                  <div className="flex -space-x-1">
                    <svg className={`w-4 h-4 ${message.read ? 'text-blue-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <svg className={`w-4 h-4 ${message.read ? 'text-blue-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
