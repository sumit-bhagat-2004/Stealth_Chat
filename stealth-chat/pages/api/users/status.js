import { getCollection, COLLECTIONS } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // First, check if Socket.IO server has real-time data
    // We'll get this from the Socket.IO server's in-memory map
    // For now, we'll primarily rely on database but this could be enhanced
    
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne(
      { userId: userId },
      { projection: { isOnline: 1, lastSeen: 1, displayName: 1, name: 1 } }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For real-time status, we should ideally check the Socket.IO server's connectedUsers map
    // Since we can't directly access it from here, we'll use a different approach
    // The frontend will use Socket.IO events for real-time updates instead of this API
    
    // Calculate last seen text (fallback for when user was last in database)
    let lastSeenText = 'Last seen a long time ago';
    if (user.lastSeen) {
      const now = Date.now();
      const lastSeenTime = new Date(user.lastSeen).getTime();
      const diffMs = now - lastSeenTime;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 5) {
        // If last seen within 5 minutes, might still be online
        lastSeenText = 'Last seen recently';
      } else if (diffMinutes < 60) {
        lastSeenText = `Last seen ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        lastSeenText = `Last seen ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        lastSeenText = `Last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else {
        lastSeenText = `Last seen ${new Date(user.lastSeen).toLocaleDateString()}`;
      }
    }

    // Note: Real-time online status should be determined by Socket.IO connection
    // This API provides fallback data only
    res.status(200).json({
      userId: user.userId,
      isOnline: false, // Will be overridden by real-time Socket.IO data
      lastSeen: user.lastSeen,
      lastSeenText: lastSeenText,
      displayName: user.displayName || user.name,
      note: 'Real-time status determined by Socket.IO connection'
    });

  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
