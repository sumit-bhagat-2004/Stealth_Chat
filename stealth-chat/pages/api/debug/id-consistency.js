import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  try {
    // Get users from the database (same as users/list)
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    const users = await usersCollection
      .find({ isActive: true }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    console.log('=== ID CONSISTENCY CHECK ===');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`  - _id: ${user._id}, custom id: ${user.id}, username: ${user.username}`);
    });

    // Check recent messages to see what IDs are being used
    const messagesCollection = await getCollection(COLLECTIONS.MESSAGES);
    const recentMessages = await messagesCollection
      .find({})
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();

    console.log('\nRecent messages:');
    recentMessages.forEach(msg => {
      console.log(`  - From: ${msg.senderId} → To: ${msg.recipientId}: "${msg.message}"`);
    });

    // Test the ID matching
    const senderIds = [...new Set(recentMessages.map(m => m.senderId))];
    const recipientIds = [...new Set(recentMessages.map(m => m.recipientId))];
    const userCustomIds = users.map(u => u.id);
    const userMongoIds = users.map(u => u._id.toString());

    console.log('\n=== ID MATCHING ANALYSIS ===');
    console.log('Sender IDs in messages:', senderIds);
    console.log('Recipient IDs in messages:', recipientIds);
    console.log('Available custom IDs:', userCustomIds);
    console.log('Available MongoDB IDs:', userMongoIds);

    const senderMatches = senderIds.map(id => ({
      id,
      matchesCustomId: userCustomIds.includes(id),
      matchesMongoId: userMongoIds.includes(id)
    }));

    const recipientMatches = recipientIds.map(id => ({
      id,
      matchesCustomId: userCustomIds.includes(id),
      matchesMongoId: userMongoIds.includes(id)
    }));

    console.log('\nSender ID matches:', senderMatches);
    console.log('Recipient ID matches:', recipientMatches);

    res.status(200).json({
      users: users.map(u => ({
        _id: u._id.toString(),
        customId: u.id,
        username: u.username,
        displayName: u.displayName
      })),
      recentMessages: recentMessages.map(m => ({
        senderId: m.senderId,
        recipientId: m.recipientId,
        message: m.message,
        timestamp: m.timestamp
      })),
      analysis: {
        senderMatches,
        recipientMatches,
        customIds: userCustomIds,
        mongoIds: userMongoIds
      }
    });
  } catch (error) {
    console.error('ID consistency check error:', error);
    res.status(500).json({ error: error.message });
  }
}
