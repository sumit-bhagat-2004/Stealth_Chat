import { useState } from 'react';
import Head from 'next/head';
import HomepageView from '../components/HomepageView';
import SearchResultsView from '../components/SearchResultsView';
import ChatView from '../components/ChatView';

// Predefined users and passwords. In a real app, this would come from a secure backend.
const USERS = {
    'user_a': { id: 'user_a', name: 'Alex', password: 'blueOcean42' },
    'user_b': { id: 'user_b', name: 'Ben', password: 'silverMountain8' }
};

export default function Home() {
    const [currentView, setCurrentView] = useState('homepage'); // 'homepage', 'search', 'chat'
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [messages, setMessages] = useState([]); // Simulating database

    // The core logic for handling the search/password input
    const handleSearch = (term) => {
        const userFound = Object.values(USERS).find(u => u.password === term);

        if (userFound) {
            // Password matched: Log in and switch to chat view
            const other = userFound.id === 'user_a' ? USERS['user_b'] : USERS['user_a'];
            setLoggedInUser(userFound);
            setOtherUser(other);
            setMessages([]); // Clear previous chat simulation
            setCurrentView('chat');
        } else {
            // No match: Show fake search results
            setSearchTerm(term);
            setCurrentView('search');
        }
    };

    // Logout and return to the homepage
    const handleLogout = () => {
        setLoggedInUser(null);
        setOtherUser(null);
        setCurrentView('homepage');
    };

    // Go back to homepage from search results
    const goHome = () => {
        setCurrentView('homepage');
    }

    // Function to add a new message to our simulated database
    const handleSendMessage = (content, type) => {
        if (!loggedInUser) return;
        const newMessage = {
            id: Date.now(), // simple unique ID
            content: content,
            type: type,
            senderId: loggedInUser.id,
            timestamp: new Date(),
        };
        setMessages([...messages, newMessage]);
    };

    // Render the correct view based on the current state
    const renderView = () => {
        switch (currentView) {
            case 'chat':
                return (
                    <ChatView
                        currentUser={loggedInUser}
                        chatWith={otherUser}
                        onLogout={handleLogout}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                );
            case 'search':
                return <SearchResultsView searchTerm={searchTerm} onGoHome={goHome} />;
            case 'homepage':
            default:
                return <HomepageView onSearch={handleSearch} />;
        }
    };

    return (
        <div>
            <Head>
                <title>Stealth Chat</title>
                <meta name="description" content="A hidden chat application" />
                <link rel="icon" href="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" />
            </Head>
            <main>
                {renderView()}
            </main>
        </div>
    );
}
