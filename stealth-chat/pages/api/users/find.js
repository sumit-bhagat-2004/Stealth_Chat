import { connectToDatabase } from '../../../utils/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user by username (excluding password)
    const user = await usersCollection.findOne(
      { 
        username, 
        isActive: true 
      },
      { 
        projection: { 
          password: 0  // Exclude password field
        }
      }
    );

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found',
        user: null 
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Find user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
