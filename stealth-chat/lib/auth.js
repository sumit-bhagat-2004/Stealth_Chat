import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getCollection, COLLECTIONS } from './mongodb';

// Get users from localStorage (for development) or database (for production)
const getUsersFromStorage = () => {
  // In a server environment, we'll use a fallback or database
  return [];
};

// Verify username/password for login
export const verifyPassword = async (inputUsername) => {
  try {
    // For development, check localStorage-based users
    if (typeof window !== 'undefined') {
      const users = JSON.parse(localStorage.getItem('stealthChatUsers') || '[]');
      const user = users.find(u => u.username === inputUsername);
      
      if (user) {
        return {
          userId: user.id,
          name: user.displayName,
          avatar: user.profileImage,
          username: user.username
        };
      }
    }
    
    // For production, check database users
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const user = await usersCollection.findOne({ username: inputUsername });
    
    if (user) {
      return {
        userId: user.userId || user._id.toString(),
        name: user.displayName || user.name,
        avatar: user.profileImage || user.avatar,
        username: user.username
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying password:', error);
    return null;
  }
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Change user password
export const changePassword = async (userId, newPassword) => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    const result = await usersCollection.updateOne(
      { userId },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error changing password:', error);
    return false;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    
    // Try to find user by custom userId first, then by _id
    let user = await usersCollection.findOne({ userId });
    
    if (!user && userId.length === 24) {
      // If not found and looks like ObjectId, try finding by _id
      try {
        const { ObjectId } = require('mongodb');
        user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      // Ensure we return consistent userId format
      userWithoutPassword.userId = user.id || user._id.toString();
      return userWithoutPassword;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

// Update user last active
export const updateLastActive = async (userId) => {
  try {
    const usersCollection = await getCollection(COLLECTIONS.USERS);
    await usersCollection.updateOne(
      { userId },
      { $set: { lastActive: new Date() } }
    );
  } catch (error) {
    console.error('Error updating last active:', error);
  }
};

// Middleware to verify authentication
export const requireAuth = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = verifyToken(token);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      const user = await getUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      req.user = user;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};
