import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentUserId, otherUserId, page = 1, limit = 50 } = req.query;

    if (!otherUserId) {
      return res.status(400).json({ error: 'otherUserId is required' });
    }

    // If currentUserId is not provided, we can't fetch messages
    if (!currentUserId) {
      return res.status(200).json({ 
        messages: [], 
        totalCount: 0, 
        currentPage: parseInt(page),
        totalPages: 0 
      });
    }

    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Get messages between the two users using flexible ID matching
    const messages = await messagesCollection
      .find({
        $or: [
          { senderId: currentUserId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: currentUserId }
        ]
      })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .toArray();

    // Get user info for each message using flexible ID matching
    const userIds = [...new Set(messages.map(msg => [msg.senderId, msg.recipientId]).flat())];
    const users = await usersCollection
      .find({ 
        $or: [
          { _id: { $in: userIds.filter(id => ObjectId.isValid(id) && id.length === 24).map(id => new ObjectId(id)) } },
          { userId: { $in: userIds } }
        ]
      })
      .project({ password: 0 })
      .toArray();

    const userMap = {};
    users.forEach(user => {
      const userId = user.userId || user._id.toString();
      userMap[userId] = {
        name: user.displayName || user.name,
        avatar: user.profileImage
      };
    });

    // Format messages with user info
    const formattedMessages = messages.reverse().map(msg => ({
      _id: msg._id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      message: msg.message,
      messageType: msg.messageType,
      fileUrl: msg.fileUrl,
      fileName: msg.fileName,
      timestamp: msg.timestamp,
      read: msg.read,
      senderName: userMap[msg.senderId.toString()]?.name,
      senderAvatar: userMap[msg.senderId.toString()]?.avatar,
      isSentByMe: msg.senderId.toString() === currentUserId
    }));

    // Mark messages as read - handle both ObjectId and custom user ID formats
    const markReadQuery = {
      senderId: otherUserId,
      recipientId: currentUserId,
      read: false
    };

    await messagesCollection.updateMany(
      markReadQuery,
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      messages: formattedMessages,
      hasMore: messages.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
