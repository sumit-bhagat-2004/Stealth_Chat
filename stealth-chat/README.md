# Stealth Chat

A sophisticated messaging application disguised as a Flipkart e-commerce website with real-time chat functionality, dual password authentication, and comprehensive file sharing capabilities.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env.local`
   - Add your MongoDB URI and Cloudinary credentials

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access Application**
   - Open http://localhost:3000
   - Click Flipkart logo 5 times to access chat
   - Use password: `flipkart123`

## 📋 Features

- 🛡️ **Stealth Operation**: Perfect Flipkart disguise with real product search
- 🔐 **Dual Authentication**: Main password + chat password system
- 💬 **Real-time Messaging**: WhatsApp-like interface with Socket.IO
- 📁 **File Sharing**: Images, videos, documents via Cloudinary
- 🎤 **Voice Messages**: Record and share audio messages
- 📱 **Responsive Design**: Mobile-first with Tailwind CSS
- 🗄️ **Persistent Storage**: MongoDB for chat history and user data
- 🚀 **Modern Stack**: Next.js 15 with React 19

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Node.js, MongoDB, Socket.IO
- **File Storage**: Cloudinary
- **Authentication**: JWT, bcryptjs
- **Real-time**: Socket.IO
- **Deployment**: Vercel ready

## 📖 Documentation

See [SETUP.md](./SETUP.md) for complete installation and configuration instructions.

## 🔧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Environment Variables

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
MAIN_PASSWORD=flipkart123
CHAT_PASSWORD=stealth456
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Manual Deployment
```bash
npm run build
# Upload build files to your hosting provider
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Secure file upload validation
- Environment variable protection
- Rate limiting on API routes

## 📱 Mobile Support

Fully responsive design optimized for:
- iOS Safari
- Android Chrome
- Mobile Firefox
- Progressive Web App ready

## 🎯 Usage

1. **Stealth Mode**: Application appears as normal Flipkart website
2. **Hidden Access**: Click logo 5 times to trigger password prompt
3. **Authentication**: Enter main password to access chat interface
4. **User System**: Create account or login with existing credentials
5. **Chat Features**: Send messages, files, voice recordings in real-time

## 🔧 Configuration

### Passwords
- **Main Password**: Access to chat interface
- **Chat Password**: User authentication within chat
- Both configurable via environment variables

### File Uploads
- Supports images, videos, documents
- Automatic optimization via Cloudinary
- Size limits and type validation

### Real-time Features
- Instant message delivery
- Online/offline status
- Typing indicators
- Message read receipts

## 🛡️ Privacy & Security

- No tracking or analytics
- Encrypted password storage
- Secure file transmission
- Optional message encryption
- Self-hosted deployment option

## 📞 Support

For setup assistance or bug reports, please check the documentation in SETUP.md or create an issue.

## 📄 License

MIT License - see LICENSE file for details.

---

**⚠️ Disclaimer**: This application is for educational purposes. Ensure compliance with all applicable laws and platform terms of service.
