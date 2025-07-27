import { useState, useEffect } from 'react';
import Head from 'next/head';
import HomepageView from '../components/HomepageView';
import SearchResultsView from '../components/SearchResultsView';
import ChatDashboard from '../components/ChatDashboard';
import RealTimeChatView from '../components/RealTimeChatView';
import FlipkartInterface from '../components/FlipkartInterface';
import UserManagement from '../components/UserManagement';
import LoginModal from '../components/LoginModal';
import { ensureDefaultUsers } from '../utils/mongoConstants';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function Home() {
  const [currentView, setCurrentView] = useState('homepage'); // 'homepage', 'search', 'chat', 'realTimeChat', 'flipkart', 'userManagement'
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [chatWith, setChatWith] = useState(null);

  // Initialize default users from MongoDB on component mount
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Ensure default users exist in MongoDB
      await ensureDefaultUsers();
      
      // Check for existing token
      const token = localStorage.getItem('token');
      if (token) {
        await verifyToken(token);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('App initialization error:', error);
      setLoading(false);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLoggedInUser(data.user);
        setCurrentView('chat');
      } else {
        localStorage.removeItem('token');
        Cookies.remove('token');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('token');
      Cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  // Handle hidden access (logo clicks)
  const handleHiddenAccess = () => {
    setShowLoginModal(true);
  };

  // Handle user login
  const handleLogin = (userData) => {
    setLoggedInUser(userData);
    setCurrentView('chat');
  };

  // Handle admin access
  const handleAdminAccess = () => {
    setCurrentView('userManagement');
  };

  // Handle search - now only for searching products, not login
  const handleSearch = async (term) => {
    setSearchTerm(term);
    setCurrentView('search');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    Cookies.remove('token');
    setLoggedInUser(null);
    setCurrentView('homepage');
    toast.success('Logged out successfully');
  };

  const handleBackToHome = () => {
    setCurrentView('homepage');
    setSearchTerm('');
  };

  const handleUserCreated = (user) => {
    // Auto-login the newly created user
    setLoggedInUser({
      userId: user.id,
      name: user.displayName,
      username: user.username,
      avatar: user.profileImage
    });
    
    // Go directly to chat dashboard (users can select who to chat with)
    setCurrentView('chat');
    toast.success(`Account created and logged in as ${user.displayName}!`);
  };

  const handleBackToUserManagement = () => {
    setCurrentView('userManagement');
  };

  const handleChangePassword = async () => {
    if (!loggedInUser) {
      toast.error('You must be logged in to change password');
      return;
    }

    const newPassword = prompt('Enter new password (minimum 6 characters):');
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: loggedInUser.userId || loggedInUser.id,
          newPassword 
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Failed to change password');
    }
  };

  const startRealTimeChat = (user) => {
    setChatWith(user);
    setCurrentView('realTimeChat');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-flipkart-grey">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-flipkart-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading Stealth Chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Flipkart - Your Secure Shopping Experience</title>
        <meta name="description" content="Online Shopping India - Buy mobiles, laptops, cameras, books, watches, apparel, shoes and e-Gift Cards" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </Head>

      {currentView === 'homepage' && (
        <HomepageView onSearch={handleSearch} onHiddenAccess={handleHiddenAccess} />
      )}

      {currentView === 'search' && (
        <SearchResultsView 
          searchTerm={searchTerm} 
          onBackToHome={handleBackToHome} 
        />
      )}

      {currentView === 'flipkart' && (
        <FlipkartInterface 
          searchQuery={searchTerm} 
          onBackToHome={handleBackToHome} 
        />
      )}

      {currentView === 'chat' && loggedInUser && (
        <ChatDashboard
          currentUser={loggedInUser}
          onLogout={handleLogout}
          onChangePassword={handleChangePassword}
          onStartChat={startRealTimeChat}
        />
      )}

      {currentView === 'realTimeChat' && loggedInUser && chatWith && (
        <RealTimeChatView
          currentUser={loggedInUser}
          chatWith={chatWith}
          onBack={() => setCurrentView('chat')}
        />
      )}

      {currentView === 'userManagement' && (
        <UserManagement
          onUserCreated={handleUserCreated}
          onBack={handleBackToHome}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onAdminAccess={handleAdminAccess}
        />
      )}
    </>
  );
}
