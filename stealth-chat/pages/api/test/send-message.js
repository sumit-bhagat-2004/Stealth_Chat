import { getCollection, COLLECTIONS } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { senderId, recipientId, message } = req.body;

    if (!senderId || !recipientId || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save test message to database
    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
    const messageObj = {
      senderId: senderId,
      recipientId: recipientId,
      message: message,
      messageType: 'text',
      fileUrl: null,
      fileName: null,
      timestamp: new Date(),
      read: false
    };

    const result = await messagesCollection.insertOne(messageObj);
    const savedMessage = { ...messageObj, _id: result.insertedId };

    console.log(`✅ Test message saved: ${senderId} → ${recipientId}: "${message}"`);

    // Try to emit via Socket.IO if available
    if (res.socket?.server?.io) {
      const io = res.socket.server.io;
      
      // Find recipient socket
      const recipientRoom = recipientId.startsWith('user_') ? recipientId : `user_${recipientId}`;
      console.log(`📤 Attempting to emit to room: ${recipientRoom}`);
      
      io.to(recipientRoom).emit('new-message', savedMessage);
      console.log(`✅ Message emitted to ${recipientRoom}`);
    }

    res.status(200).json({
      success: true,
      message: 'Test message sent',
      savedMessage
    });
  } catch (error) {
    console.error('Test message error:', error);
    res.status(500).json({ error: error.message });
  }
}
