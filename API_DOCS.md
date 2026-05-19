# BRIXTON Friends - Complete API Documentation

## Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

## Authentication
All protected endpoints require `Authorization: Bearer <token>` header

---

## Endpoints

### 🔐 Authentication Endpoints

#### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword",
  "full_name": "John Doe"
}

Response 201:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1
}

Error 400:
{
  "errors": [
    { "msg": "Invalid value", "param": "email" }
  ]
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response 200:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": 1,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "full_name": "John Doe"
  }
}

Error 401:
{
  "error": "Invalid credentials"
}
```

---

### 👤 User Endpoints

#### Get User Profile
```http
GET /api/users/1
Authorization: Bearer <token>

Response 200:
{
  "id": 1,
  "username": "johndoe",
  "email": "user@example.com",
  "full_name": "John Doe",
  "latitude": 51.5074,
  "longitude": -0.1278,
  "created_at": "2024-05-19T10:30:00Z"
}
```

#### Update Location (for map)
```http
POST /api/users/update-location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 51.5074,
  "longitude": -0.1278
}

Response 200:
{
  "message": "Location updated successfully"
}
```

#### Search Users
```http
GET /api/users/search/john
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Smith",
    "latitude": 51.51,
    "longitude": -0.13
  }
]

Query Parameters:
- limit: (optional, default: 20)

GET /api/users/search/john?limit=50
```

---

### 👥 Friends Endpoints

#### Send Friend Request
```http
POST /api/friends/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": 2
}

Response 201:
{
  "message": "Friend request sent",
  "requestId": 5
}

Error 400:
{
  "error": "Cannot add yourself"
}
```

#### Accept Friend Request
```http
POST /api/friends/accept
Authorization: Bearer <token>
Content-Type: application/json

{
  "request_id": 5
}

Response 200:
{
  "message": "Friend request accepted"
}
```

#### Reject Friend Request
```http
POST /api/friends/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "request_id": 5
}

Response 200:
{
  "message": "Friend request rejected"
}
```

#### Get Friends List
```http
GET /api/friends/list
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 2,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Smith",
    "latitude": 51.51,
    "longitude": -0.13
  }
]
```

#### Get Pending Friend Requests
```http
GET /api/friends/requests/pending
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 5,
    "sender_id": 3,
    "username": "alice",
    "email": "alice@example.com",
    "full_name": "Alice Johnson",
    "created_at": "2024-05-19T10:30:00Z"
  }
]
```

#### Remove Friend
```http
DELETE /api/friends/2
Authorization: Bearer <token>

Response 200:
{
  "message": "Friend removed"
}
```

---

### 💬 Chat Endpoints

#### Send Message
```http
POST /api/chat/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipient_id": 2,
  "content": "Hey, how are you?"
}

Response 201:
{
  "message": "Message sent",
  "messageId": 42
}
```

#### Get Conversation
```http
GET /api/chat/conversation/2
Authorization: Bearer <token>

Response 200:
[
  {
    "id": 40,
    "sender_id": 1,
    "recipient_id": 2,
    "content": "Hi there!",
    "created_at": "2024-05-19T10:20:00Z",
    "is_read": true
  },
  {
    "id": 41,
    "sender_id": 2,
    "recipient_id": 1,
    "content": "Hey! How are you?",
    "created_at": "2024-05-19T10:21:00Z",
    "is_read": false
  }
]

Query Parameters:
- limit: (optional, default: 50) Number of messages to return

GET /api/chat/conversation/2?limit=100
```

#### Mark Messages as Read
```http
POST /api/chat/mark-read
Authorization: Bearer <token>
Content-Type: application/json

{
  "message_ids": [40, 41, 42]
}

Response 200:
{
  "message": "Messages marked as read"
}
```

#### Get Unread Message Count
```http
GET /api/chat/unread-count
Authorization: Bearer <token>

Response 200:
[
  {
    "sender_id": 2,
    "unread_count": 3
  },
  {
    "sender_id": 3,
    "unread_count": 1
  }
]
```

#### Get Recent Chats
```http
GET /api/chat/recent
Authorization: Bearer <token>

Response 200:
[
  {
    "friend_id": 2,
    "username": "johndoe",
    "full_name": "John Smith",
    "last_message_time": "2024-05-19T10:30:00Z",
    "last_message": "See you soon!"
  }
]

Query Parameters:
- limit: (optional, default: 20)

GET /api/chat/recent?limit=50
```

---

### 🔌 WebSocket Events (Socket.io)

#### Connect & Join Room
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected');
  
  // Join a chat room
  socket.emit('join_room', {
    room_id: '1_2' // User IDs joined with _
  });
});
```

#### Receive Join Notification
```javascript
socket.on('message', (data) => {
  console.log(data);
  // { 
  //   content: 'A user joined', 
  //   type: 'system' 
  // }
});
```

#### Send Message (Real-time)
```javascript
socket.emit('send_message', {
  room_id: '1_2',
  sender_id: 1,
  content: 'Hello!'
});
```

#### Receive Message
```javascript
socket.on('receive_message', (data) => {
  console.log(data);
  // {
  //   sender_id: 2,
  //   content: 'Hi there!',
  //   timestamp: 2024-05-19T10:30:00Z,
  //   type: 'message'
  // }
});
```

#### Handle Disconnect
```javascript
socket.on('disconnect', () => {
  console.log('Disconnected');
});
```

---

### 🏥 Health Check

#### Server Status
```http
GET /api/health

Response 200:
{
  "status": "OK",
  "message": "BRIXTON Friends Backend is running"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "message": "Email is required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed"
}
```

---

## Rate Limiting

Currently implemented for password hashing. Can be extended with:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Pagination

Add to any list endpoint:
```javascript
// Example implementation
router.get('/api/friends/list', verifyToken, async (req, res) => {
  const limit = req.query.limit || 20;
  const offset = req.query.offset || 0;
  
  const friends = await Friend.getFriends(
    req.userId,
    limit,
    offset
  );
  
  res.json({
    data: friends,
    limit,
    offset,
    total: await Friend.countFriends(req.userId)
  });
});
```

Usage:
```
GET /api/friends/list?limit=20&offset=0
GET /api/friends/list?limit=20&offset=20
```

---

## Example Workflows

### New User Registration & First Chat

1. **Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","username":"testuser","password":"pass123","full_name":"Test User"}'
```

2. **Search for friends**
```bash
curl -X GET http://localhost:5000/api/users/search/john \
  -H "Authorization: Bearer TOKEN"
```

3. **Send friend request**
```bash
curl -X POST http://localhost:5000/api/friends/request \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":2}'
```

4. **Accept request (as recipient)**
```bash
curl -X POST http://localhost:5000/api/friends/accept \
  -H "Authorization: Bearer TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"request_id":1}'
```

5. **Send message**
```bash
curl -X POST http://localhost:5000/api/chat/send \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_id":2,"content":"Hey!"}'
```

6. **Get conversation**
```bash
curl -X GET http://localhost:5000/api/chat/conversation/2 \
  -H "Authorization: Bearer TOKEN"
```

---

## Frontend Integration Example

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create instance with default headers
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Example usage
async function searchUsers(term) {
  try {
    const response = await api.get(`/users/search/${term}`);
    return response.data;
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

---

## Rate Limits (Recommended)

| Endpoint | Limit | Window |
|----------|-------|--------|
| /api/auth/register | 5 | 1 hour |
| /api/auth/login | 10 | 1 hour |
| /api/users/search | 30 | 1 minute |
| /api/chat/send | 60 | 1 minute |
| Others | 100 | 1 minute |

---

## API Versioning (Future)

When breaking changes occur, version endpoints:
```
GET /api/v2/users/:id
GET /api/v1/users/:id (deprecated)
```

---

For more details, see the source code comments in `backend/src/routes/`
