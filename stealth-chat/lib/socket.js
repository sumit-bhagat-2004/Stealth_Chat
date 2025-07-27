import { Server } from 'socket.io';
import { verifyToken, updateLastActive } from './auth';
import { getCollection, COLLECTIONS } from './mongodb';
import { SOCKET_EVENTS } from '../utils/constants';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = verifyToken(token);
      
      if (!decoded) {
        return next(new Error('Authentication error'));
      }
      
      socket.userId = decoded.userId;
      await updateLastActive(decoded.userId);
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room for notifications
    socket.join(socket.userId);

    // Handle joining chat rooms
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (roomId) => {
      socket.join(roomId);
      socket.currentRoom = roomId;
      
      // Notify room that user is online
      socket.to(roomId).emit(SOCKET_EVENTS.USER_ONLINE, {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle leaving chat rooms
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId) => {
      socket.leave(roomId);
      
      // Notify room that user is offline
      socket.to(roomId).emit(SOCKET_EVENTS.USER_OFFLINE, {
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Handle sending messages
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (messageData) => {
      try {
        const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
        
        const message = {
          ...messageData,
          sender: socket.userId,
          timestamp: new Date(),
          delivered: false,
          read: false
        };

        // Save message to database
        const result = await messagesCollection.insertOne(message);
        message._id = result.insertedId;

        // Send message to room
        io.to(messageData.roomId).emit(SOCKET_EVENTS.RECEIVE_MESSAGE, message);
        
        // Update room last message
        const roomsCollection = await getCollection(COLLECTIONS.ROOMS);
        await roomsCollection.updateOne(
          { roomId: messageData.roomId },
          {
            $set: {
              lastMessage: message,
              lastActivity: new Date()
            }
          },
          { upsert: true }
        );

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on(SOCKET_EVENTS.USER_TYPING, (data) => {
      socket.to(data.roomId).emit(SOCKET_EVENTS.USER_TYPING, {
        userId: socket.userId,
        roomId: data.roomId
      });
    });

    socket.on(SOCKET_EVENTS.USER_STOPPED_TYPING, (data) => {
      socket.to(data.roomId).emit(SOCKET_EVENTS.USER_STOPPED_TYPING, {
        userId: socket.userId,
        roomId: data.roomId
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
      
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit(SOCKET_EVENTS.USER_OFFLINE, {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default io;
