import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import FriendsMap from './components/FriendsMap';
import FriendsPanel from './components/FriendsPanel';
import ChatWindow from './components/ChatWindow';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setUser(null);
    setSelectedFriend(null);
  };

  if (!token || !user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>🌍 BRIXTON Friends</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </header>

      <div style={styles.mainContainer}>
        <div style={styles.leftPanel}>
          <FriendsPanel
            userId={userId}
            token={token}
            onChatSelect={setSelectedFriend}
          />
        </div>

        <div style={styles.middlePanel}>
          <FriendsMap userId={userId} token={token} />
        </div>

        <div style={styles.rightPanel}>
          {selectedFriend ? (
            <ChatWindow
              friend={selectedFriend}
              userId={parseInt(userId)}
              token={token}
            />
          ) : (
            <div style={styles.noChatSelected}>
              No chat selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  app: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f0f0f0'
  },
  header: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  logoutBtn: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
    gap: '10px',
    padding: '10px',
    overflow: 'hidden'
  },
  leftPanel: {
    flex: 0.25,
    minWidth: '250px'
  },
  middlePanel: {
    flex: 0.35
  },
  rightPanel: {
    flex: 0.4
  },
  noChatSelected: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    color: '#999'
  }
};

export default App;
