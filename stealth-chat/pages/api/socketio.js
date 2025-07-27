import { Server } from 'socket.io';
import { getCollection, COLLECTIONS } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Helper function to update user online status in database
const updateUserOnlineStatus = async (userId, isOnline, lastSeen) => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    await usersCollection.updateOne(
      { userId: userId },
      { 
        $set: { 
          isOnline: isOnline,
          lastSeen: lastSeen 
        } 
      },
      { upsert: false }
    );
    console.log(`📊 Updated ${userId} online status: ${isOnline}, last seen: ${lastSeen.toISOString()}`);
  } catch (error) {
    console.error('Error updating user online status:', error);
  }
};

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new Server(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    // Track connected users with real-time status
    const connectedUsers = new Map(); // userId -> { socketId, lastSeen, isOnline }
    
    // Helper function to get real-time online users list
    const getOnlineUsers = () => {
      return Array.from(connectedUsers.entries())
        .filter(([userId, data]) => data.isOnline && data.socketId)
        .map(([userId, data]) => ({
          userId,
          lastSeen: data.lastSeen,
          isOnline: true
        }));
    };

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);

      // User joins a room (for private messaging)
      socket.on('join-room', (userId) => {
        // Normalize room name - if userId already starts with 'user_', use it as is
        const roomName = userId.startsWith('user_') ? userId : `user_${userId}`;
        socket.join(roomName);
        
        // Track this user as connected with current timestamp
        connectedUsers.set(userId, { 
          socketId: socket.id, 
          lastSeen: new Date(),
          isOnline: true 
        });
        console.log(`👤 User ${userId} joined room ${roomName} - Now online`);
        console.log(`🏠 All socket rooms:`, Array.from(socket.rooms));
        console.log(`👥 Online users:`, getOnlineUsers().map(u => u.userId));
        
        socket.userId = userId;

        // Broadcast user online status to all connected users
        socket.broadcast.emit('user-online', { userId, isOnline: true });
        
        // Update user's online status in database (optional, for persistence)
        updateUserOnlineStatus(userId, true, new Date());
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        if (socket.userId) {
          const now = new Date();
          // Mark user as offline but keep in map for a short time
          const userStatus = connectedUsers.get(socket.userId);
          if (userStatus && userStatus.socketId === socket.id) {
            connectedUsers.set(socket.userId, { 
              socketId: null, 
              lastSeen: now,
              isOnline: false 
            });
            console.log(`👥 User ${socket.userId} went OFFLINE. Last seen: ${now.toISOString()}`);
            
            // Broadcast user offline status with last seen
            socket.broadcast.emit('user-offline', { 
              userId: socket.userId, 
              isOnline: false,
              lastSeen: now 
            });
            
            // Update user's online status in database
            updateUserOnlineStatus(socket.userId, false, now);
          }
          
          // Clean up after 30 seconds (in case user doesn't reconnect)
          setTimeout(() => {
            const currentStatus = connectedUsers.get(socket.userId);
            if (currentStatus && !currentStatus.isOnline && !currentStatus.socketId) {
              console.log(`🧹 Cleaning up offline user ${socket.userId} from memory`);
            }
          }, 30000);
        }
      });

      // Handle new message
      socket.on('send-message', async (data) => {
        try {
          const { senderId, recipientId, message, messageType = 'text', fileUrl, fileName } = data;

          console.log(`📨 Attempting to send message from ${senderId} to ${recipientId}`);
          console.log(`📨 Message content:`, message);
          console.log(`📨 Current socket rooms:`, Array.from(socket.rooms));
          console.log(`📨 Target room: user_${recipientId}`);
          console.log(`📨 Is recipient online?`, connectedUsers.has(recipientId));

          if (!senderId || !recipientId || (!message && !fileUrl)) {
            socket.emit('message-error', { error: 'Missing required fields' });
            return;
          }

          // Save message to database
          const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
          const messageObj = {
            senderId: senderId,
            recipientId: recipientId,
            message: message || '',
            messageType, // 'text', 'image', 'file', 'voice'
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            timestamp: new Date(),
            read: false
          };

          const result = await messagesCollection.insertOne(messageObj);
          const savedMessage = { ...messageObj, _id: result.insertedId };

          // Emit to sender
          socket.emit('message-sent', savedMessage);
          console.log(`✅ Message sent back to sender ${senderId}`);

          // Emit to recipient if they're online
          const recipientRoom = recipientId.startsWith('user_') ? recipientId : `user_${recipientId}`;
          console.log(`📊 All active rooms in server:`, Array.from(io.sockets.adapter.rooms.keys()));
          console.log(`📊 Looking for recipient room: ${recipientRoom}`);
          console.log(`📊 Recipients in room ${recipientRoom}:`,  io.sockets.adapter.rooms.get(recipientRoom)?.size || 0);
          
          socket.to(recipientRoom).emit('new-message', savedMessage);
          console.log(`📤 Message emitted to recipient room: ${recipientRoom}`);
          console.log(`📊 Current rooms for debugging:`, Array.from(socket.rooms));

          console.log(`Message sent from ${senderId} to ${recipientId}`);
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('message-error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { recipientId, isTyping } = data;
        socket.to(`user_${recipientId}`).emit('user-typing', {
          userId: socket.userId,
          isTyping
        });
      });

      // Handle message delivered status
      socket.on('message-delivered', async (data) => {
        try {
          const { messageId, userId } = data;
          const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
          
          // Update message as delivered
          const result = await messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            { $set: { delivered: true } }
          );

          if (result.modifiedCount > 0) {
            // Find the message to get sender info
            const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
            if (message) {
              // Notify the sender that message was delivered
              const senderRoom = message.senderId.startsWith('user_') ? message.senderId : `user_${message.senderId}`;
              socket.to(senderRoom).emit('message-delivered', { messageId });
              console.log(`📬 Message ${messageId} marked as delivered by ${userId}`);
            }
          }
        } catch (error) {
          console.error('Error marking message as delivered:', error);
        }
      });

      // Handle message read status
      socket.on('message-read', async (data) => {
        try {
          const { messageId, userId } = data;
          const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
          
          // Update message as read (and delivered)
          const result = await messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            { $set: { read: true, delivered: true } }
          );

          if (result.modifiedCount > 0) {
            // Find the message to get sender info
            const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
            if (message) {
              // Notify the sender that message was read
              const senderRoom = message.senderId.startsWith('user_') ? message.senderId : `user_${message.senderId}`;
              socket.to(senderRoom).emit('message-read', { messageId });
              console.log(`👁️ Message ${messageId} marked as read by ${userId}`);
            }
          }
        } catch (error) {
          console.error('Error marking message as read:', error);
        }
      });

      // Handle get online users request
      socket.on('get-online-users', () => {
        const onlineUsers = getOnlineUsers();
        socket.emit('online-users', onlineUsers);
        console.log(`📊 Sent real-time online users list: ${onlineUsers.length} users online`);
      });

      // Handle check specific user status
      socket.on('check-user-status', (userId) => {
        console.log(`📊 Status check requested for user: ${userId}`);
        const userStatus = connectedUsers.get(userId);
        const isOnline = userStatus && userStatus.isOnline && userStatus.socketId;
        console.log(`📊 User ${userId} status: ${JSON.stringify(userStatus)} -> ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
        
        socket.emit('user-status-response', {
          userId,
          isOnline: isOnline,
          lastSeen: userStatus ? userStatus.lastSeen : null
        });
        console.log(`📊 Sent status response for ${userId}: isOnline=${isOnline}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  res.end();
};

export default SocketHandler;
