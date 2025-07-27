import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);

    // Delete user by ID - handle both MongoDB ObjectId and custom user IDs
    let query;
    if (ObjectId.isValid(userId) && userId.length === 24) {
      // MongoDB ObjectId format
      query = { _id: new ObjectId(userId) };
    } else {
      // Custom user ID format (like user_1753642560078_n9pjk8nkx) - use 'id' field not 'userId'
      query = { id: userId };
    }
    
    const result = await usersCollection.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
