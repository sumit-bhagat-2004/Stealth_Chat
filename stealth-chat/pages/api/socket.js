import { Server } from 'socket.io';
import { initSocket } from '../../lib/socket';
import { initializeDatabase } from '../../lib/mongodb';
import { initializeUsers } from '../../lib/auth';

let io;

export default async function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...');
    
    // Initialize database and users
    await initializeDatabase();
    await initializeUsers();
    
    // Initialize Socket.IO
    io = initSocket(res.socket.server);
    res.socket.server.io = io;
    
    console.log('Socket.IO server initialized');
  } else {
    console.log('Socket.IO server already running');
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
