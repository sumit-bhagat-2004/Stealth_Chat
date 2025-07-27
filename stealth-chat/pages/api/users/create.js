import { connectToDatabase } from '../../../utils/mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const { username, displayName, password, profileImage } = req.body;

    if (!username || !displayName || !password) {
      return res.status(400).json({ message: 'Username, display name, and password are required' });
    }

    // Check if username already exists
    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user object
    const newUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      displayName,
      password: hashedPassword,
      profileImage: profileImage || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      lastLogin: null
    };

    // Insert user into database
    const result = await usersCollection.insertOne(newUser);

    // Return user data (without password)
    const { password: _, ...userResponse } = newUser;
    
    return res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      id: result.insertedId
    });

  } catch (error) {
    console.error('User creation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
