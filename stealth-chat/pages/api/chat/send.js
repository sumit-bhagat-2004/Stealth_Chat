import { requireAuth } from '../../../lib/auth';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { generateRoomId } from '../../../utils/helpers';
import { MESSAGE_TYPES } from '../../../utils/constants';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recipientId, content, type = MESSAGE_TYPES.TEXT, fileUrl, fileName, fileSize } = req.body;

    if (!recipientId || !content) {
      return res.status(400).json({ error: 'Recipient ID and content are required' });
    }

    const roomId = generateRoomId(req.user.userId, recipientId);
    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);

    const message = {
      roomId,
      sender: req.user.userId,
      recipient: recipientId,
      content,
      type,
      timestamp: new Date(),
      delivered: false,
      read: false,
      ...(fileUrl && { fileUrl, fileName, fileSize })
    };

    const result = await messagesCollection.insertOne(message);
    message._id = result.insertedId;

    // Update room information
    const roomsCollection = await getCollection(COLLECTIONS.ROOMS);
    await roomsCollection.updateOne(
      { roomId },
      {
        $set: {
          participants: [req.user.userId, recipientId],
          lastMessage: message,
          lastActivity: new Date()
        }
      },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireAuth(handler);
