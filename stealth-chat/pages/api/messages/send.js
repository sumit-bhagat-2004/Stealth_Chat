import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { senderId, recipientId, message, messageType = 'text', fileUrl, fileName } = req.body;

    if (!senderId || !recipientId || (!message && !fileUrl)) {
      return res.status(400).json({ error: 'Sender ID, recipient ID and message/file are required' });
    }

    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Verify recipient exists using flexible query (handle both ObjectId and custom user IDs)
    let recipientQuery;
    if (ObjectId.isValid(recipientId) && recipientId.length === 24) {
      recipientQuery = { _id: new ObjectId(recipientId) };
    } else {
      recipientQuery = { userId: recipientId };
    }
    
    const recipient = await usersCollection.findOne(recipientQuery);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Create message object with flexible ID handling
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

    // Insert message into database
    const result = await messagesCollection.insertOne(messageObj);

    // Get sender info for response
    const sender = await usersCollection.findOne(
      { _id: new ObjectId(senderId) },
      { projection: { password: 0 } }
    );

    const responseMessage = {
      _id: result.insertedId,
      ...messageObj,
      senderId: senderId,
      recipientId: recipientId,
      senderName: sender.displayName || sender.name,
      senderAvatar: sender.profileImage
    };

    res.status(201).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
