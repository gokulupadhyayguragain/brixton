import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const ChatWindow = ({ friend, userId, token }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('receive_message', (data) => {
      if (data.sender_id === friend.id) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => newSocket.close();
  }, [friend.id]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`/api/chat/conversation/${friend.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(
        '/api/chat/send',
        { recipient_id: friend.id, content: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) => [
        ...prev,
        {
          id: response.data.messageId,
          sender_id: userId,
          content: newMessage,
          timestamp: new Date(),
          is_read: false
        }
      ]);

      if (socket) {
        socket.emit('send_message', {
          room_id: `${Math.min(userId, friend.id)}_${Math.max(userId, friend.id)}`,
          sender_id: userId,
          content: newMessage
        });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (!friend) {
    return <div style={styles.empty}>Select a friend to start chatting</div>;
  }

  if (loading) {
    return <div style={styles.empty}>Loading messages...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>{friend.full_name}</h3>
        <p style={styles.subtitle}>@{friend.username}</p>
      </div>

      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender_id === userId ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender_id === userId ? '#667eea' : '#e0e0e0',
              color: msg.sender_id === userId ? 'white' : 'black'
            }}
          >
            <p>{msg.content}</p>
          </div>
        ))}
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '600px',
    backgroundColor: 'white',
    borderRadius: '10px',
    flex: 1,
    marginLeft: '10px'
  },
  header: {
    padding: '15px',
    borderBottom: '1px solid #ddd',
    backgroundColor: '#667eea',
    color: 'white',
    borderRadius: '10px 10px 0 0'
  },
  subtitle: {
    margin: '3px 0 0 0',
    fontSize: '12px',
    opacity: 0.8
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  message: {
    padding: '10px 15px',
    borderRadius: '10px',
    maxWidth: '70%',
    wordWrap: 'break-word'
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    padding: '15px',
    borderTop: '1px solid #ddd'
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  sendBtn: {
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  empty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '600px',
    color: '#999',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px'
  }
};

export default ChatWindow;
