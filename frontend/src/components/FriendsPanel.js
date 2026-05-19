import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendsPanel = ({ userId, token, onChatSelect }) => {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await axios.get('/api/friends/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFriends(response.data);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get('/api/friends/requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (term.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`/api/users/search/${term}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId) => {
    try {
      await axios.post(
        '/api/friends/request',
        { recipient_id: recipientId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Friend request sent!');
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to send request:', error);
      alert(error.response?.data?.error || 'Failed to send request');
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await axios.post(
        '/api/friends/accept',
        { request_id: requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingRequests();
      fetchFriends();
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await axios.post(
        '/api/friends/reject',
        { request_id: requestId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h3>👥 Friends</h3>

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'friends' ? '#667eea' : '#e0e0e0'
          }}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'requests' ? '#667eea' : '#e0e0e0'
          }}
        >
          Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          style={{
            ...styles.tabButton,
            backgroundColor: activeTab === 'search' ? '#667eea' : '#e0e0e0'
          }}
        >
          Search
        </button>
      </div>

      {activeTab === 'friends' && (
        <div style={styles.list}>
          {friends.length === 0 ? (
            <p style={styles.empty}>No friends yet. Search and add friends!</p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                style={styles.item}
                onClick={() => onChatSelect(friend)}
              >
                <div style={styles.friendInfo}>
                  <p style={styles.friendName}>{friend.full_name}</p>
                  <p style={styles.friendUsername}>@{friend.username}</p>
                </div>
                <button style={styles.chatBtn}>💬</button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div style={styles.list}>
          {pendingRequests.length === 0 ? (
            <p style={styles.empty}>No pending requests</p>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} style={styles.requestItem}>
                <div>
                  <p style={styles.friendName}>{req.full_name}</p>
                  <p style={styles.friendUsername}>@{req.username}</p>
                </div>
                <div style={styles.requestActions}>
                  <button
                    onClick={() => acceptRequest(req.id)}
                    style={{ ...styles.actionBtn, backgroundColor: '#27ae60' }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    style={{ ...styles.actionBtn, backgroundColor: '#e74c3c' }}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'search' && (
        <div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            style={styles.searchInput}
          />
          {loading && <p style={styles.empty}>Searching...</p>}
          <div style={styles.list}>
            {searchResults.map((user) => (
              <div key={user.id} style={styles.item}>
                <div style={styles.friendInfo}>
                  <p style={styles.friendName}>{user.full_name}</p>
                  <p style={styles.friendUsername}>@{user.username}</p>
                </div>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  style={styles.addBtn}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '15px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
    maxHeight: '600px',
    overflowY: 'auto',
    width: '300px'
  },
  tabs: {
    display: 'flex',
    gap: '5px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  tabButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px',
    color: 'white',
    flex: 1,
    minWidth: '70px'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#f0f0f0' }
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    margin: '5px 0',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  friendUsername: {
    margin: '2px 0',
    color: '#666',
    fontSize: '12px'
  },
  chatBtn: {
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer'
  },
  addBtn: {
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer'
  },
  requestItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '5px'
  },
  requestActions: {
    display: 'flex',
    gap: '5px'
  },
  actionBtn: {
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    padding: '5px 10px',
    cursor: 'pointer'
  },
  searchInput: {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    boxSizing: 'border-box'
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '20px'
  }
};

export default FriendsPanel;
