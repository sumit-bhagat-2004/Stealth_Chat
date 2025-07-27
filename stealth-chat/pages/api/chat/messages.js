import { requireAuth } from '../../../lib/auth';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { generateRoomId } from '../../../utils/helpers';

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { otherUserId, limit = 50, offset = 0 } = req.query;

    if (!otherUserId) {
      return res.status(400).json({ error: 'Other user ID is required' });
    }

    const roomId = generateRoomId(req.user.userId, otherUserId);
    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);

    const messages = await messagesCollection
      .find({ roomId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .toArray();

    // Reverse to show oldest first
    messages.reverse();

    res.status(200).json({
      success: true,
      messages,
      roomId
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default requireAuth(handler);
