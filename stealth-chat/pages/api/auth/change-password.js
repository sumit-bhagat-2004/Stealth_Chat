import bcrypt from 'bcryptjs';
import { getCollection, COLLECTIONS } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, newPassword } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const usersCollection = await getCollection(COLLECTIONS.USERS);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password - handle both MongoDB ObjectId and custom user IDs
    let query;
    if (ObjectId.isValid(userId) && userId.length === 24) {
      // MongoDB ObjectId format
      query = { _id: new ObjectId(userId) };
    } else {
      // Custom user ID format (like user_1753642560078_n9pjk8nkx)
      query = { userId: userId };
    }

    const result = await usersCollection.updateOne(
      query,
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;
