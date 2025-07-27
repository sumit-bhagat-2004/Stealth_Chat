import { getCollection, COLLECTIONS, getDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    // Check users using direct database access
    const db = await getDatabase();
    const directUsers = await db.collection('users').find({}).limit(10).toArray();
    
    console.log('COLLECTIONS.USERS value:', COLLECTIONS.USERS);
    console.log('Direct users in database:', directUsers.map(u => ({
      _id: u._id.toString(),
      userId: u.userId,
      username: u.username,
      displayName: u.displayName,
      isActive: u.isActive
    })));

    // Also check messages
    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
    const messages = await messagesCollection.find({}).limit(5).sort({ timestamp: -1 }).toArray();
    
    console.log('Recent messages:', messages.map(m => ({
      _id: m._id,
      senderId: m.senderId,
      recipientId: m.recipientId,
      message: m.message,
      timestamp: m.timestamp
    })));

    res.status(200).json({
      collectionsUsersValue: COLLECTIONS.USERS,
      users: directUsers.map(u => ({
        _id: u._id.toString(),
        userId: u.userId,
        username: u.username,
        displayName: u.displayName,
        isActive: u.isActive
      })),
      messages: messages.map(m => ({
        _id: m._id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        message: m.message,
        timestamp: m.timestamp
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
}
