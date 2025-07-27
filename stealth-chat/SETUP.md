# Stealth Chat - Complete Setup Guide

## Project Overview

Stealth Chat is a sophisticated messaging application disguised as a Flipkart e-commerce website. It features dual password authentication, real-time messaging, file sharing, voice messages, and complete MongoDB integration.

## Features

- 🛡️ **Stealth Operation**: Disguised as Flipkart with real product search
- 🔐 **Dual Authentication**: Main password + chat password system
- 💬 **Real-time Chat**: WhatsApp-like interface with Socket.IO
- 📁 **File Sharing**: Images, videos, documents via Cloudinary
- 🎤 **Voice Messages**: Record and share audio messages
- 📱 **Responsive Design**: Mobile-first with Tailwind CSS
- 🗄️ **MongoDB Storage**: Persistent chat history and user data
- 🚀 **Next.js Framework**: Serverless API routes and React frontend

## Prerequisites

Before starting, ensure you have:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** account - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier available)
- **Cloudinary** account - [Cloudinary](https://cloudinary.com/) (free tier available)
- **Git** (optional) - [Download here](https://git-scm.com/)

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new project

2. **Create Database Cluster**
   - Click "Build a Database"
   - Choose "FREE" shared cluster
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Configure Database Access**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create username and strong password
   - Set user privileges to "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/`)
   - Replace `<password>` with your database user password

## Step 2: Cloudinary Setup

1. **Create Cloudinary Account**
   - Go to [Cloudinary](https://cloudinary.com/)
   - Sign up for a free account

2. **Get API Credentials**
   - After logging in, go to Dashboard
   - Copy the following values:
     - Cloud Name
     - API Key
     - API Secret

## Step 3: Project Installation

1. **Navigate to Project Directory**
   ```powershell
   cd "d:\Stealth Chat\Stealth_Chat\stealth-chat"
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Create Environment File**
   - Create a file named `.env.local` in the root directory
   - Add the following configuration:

   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/stealthchat?retryWrites=true&w=majority

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # JWT Secret (generate a random string)
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters

   # Application Settings
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

   # Main Application Password (for accessing chat)
   MAIN_PASSWORD=flipkart123

   # Chat Password (for specific users)
   CHAT_PASSWORD=stealth456
   ```

4. **Update Environment Variables**
   - Replace `MONGODB_URI` with your MongoDB connection string
   - Replace Cloudinary credentials with your actual values
   - Replace `JWT_SECRET` with a secure random string (minimum 32 characters)
   - Customize passwords as needed

## Step 4: Application Startup

1. **Development Mode**
   ```powershell
   npm run dev
   ```

2. **Open Application**
   - Open your browser and go to: `http://localhost:3000`
   - You should see the Flipkart homepage disguise

## Step 5: First Time Usage

1. **Access Chat Interface**
   - On the Flipkart homepage, look for the hidden trigger
   - Click on the Flipkart logo 5 times quickly
   - Enter the main password: `flipkart123` (or your custom password)

2. **User Registration/Login**
   - First time: Create a username and password
   - Returning users: Login with existing credentials
   - Enter chat password: `stealth456` (or your custom password)

3. **Start Chatting**
   - You'll enter the WhatsApp-like chat interface
   - Send messages, share files, record voice messages
   - Create multiple users to test real-time chat

## Step 6: Testing Features

### File Upload Testing
1. Click the attachment icon in chat
2. Select images, videos, or documents
3. Files will be uploaded to Cloudinary and shared in chat

### Voice Message Testing
1. Click and hold the microphone button
2. Record your message
3. Release to send the voice message

### Real-time Chat Testing
1. Open the application in multiple browser windows/tabs
2. Login with different usernames
3. Send messages to see real-time synchronization

## Deployment (Production)

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy Application**
   ```powershell
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain

### Option 2: Netlify

1. **Build Application**
   ```powershell
   npm run build
   npm run export
   ```

2. **Deploy to Netlify**
   - Upload the `out` folder to Netlify
   - Configure environment variables
   - Set up serverless functions for API routes

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify connection string format
   - Check database user permissions
   - Ensure network access is configured

2. **Cloudinary Upload Error**
   - Verify API credentials
   - Check file size limits
   - Ensure proper file types

3. **Socket.IO Connection Issues**
   - Check if port 3000 is available
   - Verify firewall settings
   - Test with different browsers

4. **Build Errors**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

### Performance Optimization

1. **Image Optimization**
   - Cloudinary automatically optimizes images
   - Configure quality settings in Cloudinary dashboard

2. **Database Indexing**
   - MongoDB indexes are automatically created
   - Monitor performance in MongoDB Atlas

3. **Caching**
   - Next.js automatically handles static file caching
   - Configure CDN for production deployment

## Security Considerations

1. **Password Security**
   - Use strong, unique passwords
   - Consider implementing password complexity requirements
   - Enable two-factor authentication for external services

2. **Environment Variables**
   - Never commit `.env.local` to version control
   - Use different credentials for development and production
   - Regularly rotate API keys and secrets

3. **Database Security**
   - Enable MongoDB encryption at rest
   - Use database-level access controls
   - Regular security audits

## Support and Maintenance

### Regular Tasks
- Monitor MongoDB Atlas usage and performance
- Check Cloudinary storage limits
- Update dependencies regularly
- Backup database periodically

### Monitoring
- MongoDB Atlas provides built-in monitoring
- Cloudinary dashboard shows usage statistics
- Next.js provides built-in analytics

## Advanced Configuration

### Custom Styling
- Modify `tailwind.config.js` for color schemes
- Update `styles/globals.css` for global styles
- Customize components in `components/` directory

### Additional Features
- Add user profiles and settings
- Implement message encryption
- Add group chat functionality
- Integrate push notifications

## Contributing

1. Follow the existing code structure
2. Use proper TypeScript types where applicable
3. Test all features before committing
4. Follow the established styling patterns

## License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Important**: This application is designed for educational purposes. Ensure you comply with all applicable laws and platform terms of service when deploying and using this application.
