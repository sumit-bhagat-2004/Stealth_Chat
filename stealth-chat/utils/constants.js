// User management utilities
export const getUsersFromStorage = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('stealthChatUsers') || '[]');
  }
  return [];
};

export const saveUsersToStorage = (users) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stealthChatUsers', JSON.stringify(users));
  }
};

export const findUserByUsername = (username) => {
  const users = getUsersFromStorage();
  return users.find(user => user.username === username);
};

// Default demo users (only created if no users exist)
export const createDefaultUsers = () => {
  const existingUsers = getUsersFromStorage();
  if (existingUsers.length === 0) {
    const defaultUsers = [
      {
        id: 'demo_user_1',
        username: 'blueOcean42',
        displayName: 'Alex',
        password: 'blueOcean42',
        profileImage: 'https://via.placeholder.com/40/3B82F6/FFFFFF?text=A',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo_user_2',
        username: 'silverMountain8',
        displayName: 'Ben',
        password: 'silverMountain8',
        profileImage: 'https://via.placeholder.com/40/EF4444/FFFFFF?text=B',
        createdAt: new Date().toISOString()
      }
    ];
    saveUsersToStorage(defaultUsers);
    return defaultUsers;
  }
  return existingUsers;
};

// Message types
export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  DOCUMENT: 'document',
  VOICE: 'voice'
};

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Socket events
export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  USER_TYPING: 'user_typing',
  USER_STOPPED_TYPING: 'user_stopped_typing',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline'
};

// Flipkart categories for homepage
export const FLIPKART_CATEGORIES = [
  { name: 'Grocery', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Mobiles', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Home & Furniture', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Appliances', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Travel', img: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Beauty, Toys & More', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
  { name: 'Two Wheelers', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80' },
];

export const FLIPKART_SAMPLE_PRODUCTS = [
  { 
    name: 'Noise ColorFit Pulse 3 Smart Watch', 
    price: '₹1,299', 
    original: '₹6,999', 
    discount: '81% off',
    img: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.1',
    reviews: '1,234'
  },
  { 
    name: 'ASUS VivoBook 15 Core i3 11th Gen', 
    price: '₹35,990', 
    original: '₹45,990', 
    discount: '21% off',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.3',
    reviews: '2,891'
  },
  { 
    name: 'iPhone 15 (Blue, 128 GB)', 
    price: '₹79,900', 
    original: '₹89,900', 
    discount: '11% off',
    img: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.6',
    reviews: '15,678'
  },
  { 
    name: 'Nike Revolution 6 Running Shoes', 
    price: '₹2,495', 
    original: '₹3,495', 
    discount: '28% off',
    img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.2',
    reviews: '5,432'
  },
  { 
    name: 'Samsung 24" Full HD Monitor', 
    price: '₹8,279', 
    original: '₹12,999', 
    discount: '36% off',
    img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.4',
    reviews: '3,218'
  },
  { 
    name: 'Kurta Sets for Women', 
    price: '₹599', 
    original: '₹1,999', 
    discount: '70% off',
    img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '3.9',
    reviews: '891'
  },
  { 
    name: 'Realme 11 Pro+ 5G (Oasis Green, 256 GB)', 
    price: '₹29,999', 
    original: '₹37,999', 
    discount: '21% off',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.2',
    reviews: '4,567'
  },
  { 
    name: 'Mi LED Smart TV 4A 80 cm (32 inch)', 
    price: '₹13,999', 
    original: '₹19,999', 
    discount: '30% off',
    img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.3',
    reviews: '67,891'
  },
  { 
    name: 'Sony WH-1000XM4 Headphones', 
    price: '₹24,990', 
    original: '₹29,990', 
    discount: '17% off',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.5',
    reviews: '8,234'
  },
  { 
    name: 'Canon EOS 1500D DSLR Camera', 
    price: '₹32,999', 
    original: '₹39,999', 
    discount: '18% off',
    img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.2',
    reviews: '2,156'
  },
  { 
    name: 'Boat Stone 1000 Bluetooth Speaker', 
    price: '₹2,499', 
    original: '₹3,999', 
    discount: '38% off',
    img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.0',
    reviews: '12,456'
  },
  { 
    name: 'Gaming Mechanical Keyboard', 
    price: '₹3,999', 
    original: '₹6,999', 
    discount: '43% off',
    img: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    rating: '4.3',
    reviews: '5,789'
  }
];
