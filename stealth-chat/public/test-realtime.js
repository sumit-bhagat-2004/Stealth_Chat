// Test script to verify real-time messaging is working
// Run this in browser console to test Socket.IO real-time messaging

console.log('🧪 Starting Real-time Messaging Test...');

// Test data
const testUsers = {
  user1: 'user_1753644214102_imlwjg9yo',
  user2: 'user_1753644401206_i4lynmmsw'
};

// Test function to check if Socket.IO events are working
window.testRealtimeMessaging = function() {
  console.log('🔍 Testing Socket.IO event reception...');
  
  // Check if socket exists
  if (typeof io === 'undefined') {
    console.error('❌ Socket.IO not loaded');
    return false;
  }
  
  // Check if socket is connected
  const socket = window.socket || (window.socket = io({ path: '/api/socketio' }));
  
  if (!socket.connected) {
    console.log('🔌 Socket not connected, attempting connection...');
    socket.connect();
  }
  
  // Add test event listeners
  socket.on('connect', () => {
    console.log('✅ Socket connected successfully');
    socket.emit('join-room', testUsers.user1);
    console.log('👤 Joined room for user1:', testUsers.user1);
  });
  
  socket.on('new-message', (message) => {
    console.log('📨 RECEIVED new-message event:', message);
  });
  
  socket.on('message-sent', (message) => {
    console.log('✅ RECEIVED message-sent event:', message);
  });
  
  console.log('🧪 Test setup complete. Send a message to see real-time events.');
  return true;
};

// Automatically run test if this script is executed
if (typeof window !== 'undefined') {
  window.testRealtimeMessaging();
}
