import { generateToken } from '../../../lib/auth';
import { connectToDatabase } from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Use MongoDB only - no localStorage fallback
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');
    
    const user = await usersCollection.findOne({ 
      username, 
      isActive: true 
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Update last login
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token using consistent user ID
    const consistentUserId = user.id || user._id.toString();
    const token = generateToken(consistentUserId);

    // Return user data (without password) - use custom id field for consistency
    const userData = {
      userId: consistentUserId, // Use consistent ID
      name: user.displayName,
      username: user.username,
      avatar: user.profileImage
    };

    res.status(200).json({
      success: true,
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
