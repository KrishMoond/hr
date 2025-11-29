# Project Chatroom - Developer Integration Guide

## Overview

This guide shows how the Project Chatroom feature is integrated into the HR system and provides code examples for developers.

## System Integration

### 1. Data Flow Diagram

```
User Interface (React)
    ↓
ProjectChat Component (displays chat UI)
    ↓
API Service (http://localhost:5000/api)
    ↓
Project Chat Routes (Express)
    ↓
ProjectChat Model (MongoDB)
    ↓
Project Model (auto-updates status)
    
    ↔ Socket.io (real-time push)
    ↔ MongoDB (persistence)
```

### 2. Component Integration

**EnhancedProjectManagement.tsx** → **ProjectChat.tsx**

```tsx
// In EnhancedProjectManagement.tsx
{selectedProjectChat && currentUser && (
  <ProjectChat
    projectId={selectedProjectChat._id}
    projectTitle={selectedProjectChat.title}
    currentUser={currentUser}
    onClose={() => setSelectedProjectChat(null)}
  />
)}

// Triggered by clicking message icon on project card
<button 
  onClick={() => setSelectedProjectChat(project)}
  className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
  title="Team Chat"
>
  <MessageSquare className="h-4 w-4" />
</button>
```

## API Endpoints

### Get Project Chat

**Endpoint**: `GET /api/project-chat/:projectId`

**Request**:
```bash
curl -X GET http://localhost:5000/api/project-chat/project123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "_id": "chat123",
  "project": "project123",
  "messages": [
    {
      "_id": "msg1",
      "sender": {
        "_id": "user1",
        "firstName": "John",
        "lastName": "Smith"
      },
      "content": "Hello team!",
      "messageType": "message",
      "timestamp": "2024-01-15T10:30:00Z",
      "readBy": []
    },
    {
      "_id": "msg2",
      "sender": {
        "_id": "user2",
        "firstName": "Sarah",
        "lastName": "Johnson"
      },
      "content": "Updated project status to Active",
      "messageType": "status_update",
      "statusUpdate": {
        "oldStatus": "planning",
        "newStatus": "active",
        "progress": 50
      },
      "timestamp": "2024-01-15T10:35:00Z",
      "readBy": [
        {
          "user": "user1",
          "readAt": "2024-01-15T10:36:00Z"
        }
      ]
    }
  ],
  "participants": [
    {
      "_id": "user1",
      "firstName": "John",
      "lastName": "Smith"
    },
    {
      "_id": "user2",
      "firstName": "Sarah",
      "lastName": "Johnson"
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Send Message

**Endpoint**: `POST /api/project-chat/:projectId/message`

**Request** (Regular Message):
```json
{
  "content": "Starting the design phase",
  "messageType": "message"
}
```

**Request** (Status Update):
```json
{
  "content": "Updated project status to Active",
  "messageType": "status_update",
  "statusUpdate": {
    "newStatus": "active",
    "progress": 50
  }
}
```

**Response**:
```json
{
  "_id": "msg3",
  "sender": {
    "_id": "user1",
    "firstName": "John",
    "lastName": "Smith"
  },
  "content": "Starting the design phase",
  "messageType": "message",
  "timestamp": "2024-01-15T10:40:00Z"
}
```

## Frontend Code Examples

### Using the ProjectChat Component

```tsx
import React, { useState } from 'react';
import ProjectChat from './ProjectChat';

function MyProject() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div>
      {/* Project List */}
      <button onClick={() => setSelectedProject(projectData)}>
        Open Chat
      </button>

      {/* Chat Modal */}
      {selectedProject && (
        <ProjectChat
          projectId={selectedProject._id}
          projectTitle={selectedProject.title}
          currentUser={currentUser}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
}
```

### Making API Calls

```typescript
// Using the API service (recommended)
import api from '../services/api';

// Get chat messages
const chat = await api.get(`/project-chat/${projectId}`);

// Send message
await api.post(`/project-chat/${projectId}/message`, {
  content: 'Team update: Completed API integration',
  messageType: 'message'
});

// Send status update
await api.post(`/project-chat/${projectId}/message`, {
  content: 'Updated project status to Active',
  messageType: 'status_update',
  statusUpdate: {
    newStatus: 'active',
    progress: 75
  }
});
```

### WebSocket Integration

```typescript
import socketService from '../services/socket';

// Listen for new messages
socketService.on('new-project-message', (data) => {
  if (data.projectId === currentProjectId) {
    // Add message to UI
    setMessages(prev => [...prev, data.message]);
  }
});

// Join project room
socketService.emit('join-project', projectId);

// Leave project room
socketService.emit('leave-project', projectId);

// Cleanup on component unmount
return () => {
  socketService.off('new-project-message');
  socketService.emit('leave-project', projectId);
};
```

## Backend Code Examples

### ProjectChat Routes

```javascript
// GET: Fetch chat for a project
router.get('/:projectId', auth, async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  
  // Verify user has access
  const isParticipant = project.teamMembers.includes(req.user._id) || 
                       project.projectManager.equals(req.user._id);
  
  if (!isParticipant) {
    return res.status(403).json({ message: 'Access denied' });
  }

  let chat = await ProjectChat.findOne({ project: req.params.projectId })
    .populate('messages.sender', 'firstName lastName')
    .populate('participants', 'firstName lastName');

  // Auto-create if doesn't exist
  if (!chat) {
    chat = new ProjectChat({
      project: req.params.projectId,
      participants: [...project.teamMembers, project.projectManager],
      messages: []
    });
    await chat.save();
  }

  res.json(chat);
});

// POST: Send message
router.post('/:projectId/message', auth, async (req, res) => {
  const { content, messageType = 'message', statusUpdate } = req.body;
  
  const chat = await ProjectChat.findOne({ project: req.params.projectId });

  // Create message
  const message = {
    sender: req.user._id,
    content,
    messageType,
    statusUpdate,
    timestamp: new Date()
  };

  chat.messages.push(message);
  
  // Auto-update project if status changed
  if (messageType === 'status_update' && statusUpdate) {
    await Project.findByIdAndUpdate(req.params.projectId, {
      status: statusUpdate.newStatus,
      progress: statusUpdate.progress || 0
    });
  }

  await chat.save();
  await chat.populate('messages.sender', 'firstName lastName');

  // Emit to project room via Socket.io
  global.io?.to(`project-${req.params.projectId}`).emit('new-project-message', {
    projectId: req.params.projectId,
    message: chat.messages[chat.messages.length - 1]
  });

  res.json(message);
});
```

### Socket.io Server Setup

```javascript
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join project-specific room
  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`User joined project room: project-${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
    console.log(`User left project room: project-${projectId}`);
  });

  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
global.io = io;
```

## Database Queries

### Get All Messages for a Project

```javascript
const chat = await ProjectChat.findOne({ project: projectId })
  .populate('messages.sender', 'firstName lastName email');
```

### Get Recent Messages (Last 50)

```javascript
const chat = await ProjectChat.findOne({ project: projectId })
  .select({ messages: { $slice: -50 } })
  .populate('messages.sender', 'firstName lastName');
```

### Get Status Updates Only

```javascript
const chat = await ProjectChat.findOne({ project: projectId });
const statusUpdates = chat.messages.filter(m => m.messageType === 'status_update');
```

### Get Messages Since Timestamp

```javascript
const chat = await ProjectChat.findOne({ project: projectId });
const recentMessages = chat.messages.filter(m => 
  new Date(m.timestamp) > new Date(sinceTime)
);
```

## Testing

### Unit Test Example

```javascript
const request = require('supertest');
const app = require('../server');
const ProjectChat = require('../models/ProjectChat');

describe('Project Chat API', () => {
  it('should get chat for a project', async () => {
    const res = await request(app)
      .get(`/api/project-chat/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(res.body).toHaveProperty('participants');
  });

  it('should send a message to project chat', async () => {
    const res = await request(app)
      .post(`/api/project-chat/${projectId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Test message',
        messageType: 'message'
      });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe('Test message');
  });

  it('should update project status on status_update message', async () => {
    await request(app)
      .post(`/api/project-chat/${projectId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: 'Status update',
        messageType: 'status_update',
        statusUpdate: {
          newStatus: 'active',
          progress: 50
        }
      });

    const project = await Project.findById(projectId);
    expect(project.status).toBe('active');
    expect(project.progress).toBe(50);
  });
});
```

## Error Handling

### Common Errors and Solutions

```typescript
// 403 Forbidden - Not a project member
try {
  await api.get(`/project-chat/${projectId}`);
} catch (error) {
  if (error.response?.status === 403) {
    // User is not on the project team
    console.log('Please add yourself to the project first');
  }
}

// 404 Not Found - Project doesn't exist
try {
  await api.get(`/project-chat/${invalidProjectId}`);
} catch (error) {
  if (error.response?.status === 404) {
    // Project was deleted or doesn't exist
    console.log('Project not found');
  }
}

// Validation Error
try {
  await api.post(`/project-chat/${projectId}/message`, {
    content: '', // Empty content
    messageType: 'invalid_type' // Invalid type
  });
} catch (error) {
  if (error.response?.status === 400) {
    // Validation failed
    console.log(error.response.data.message);
  }
}
```

## Performance Optimization

### Pagination (Future Enhancement)

```typescript
// Fetch messages with pagination
const chat = await ProjectChat.findOne({ project: projectId })
  .select({ messages: { $slice: [0, 50] } }); // Get first 50 messages

// Or use sort and limit
const recentMessages = chat.messages
  .sort((a, b) => b.timestamp - a.timestamp)
  .slice(0, 50);
```

### Indexing

```javascript
// In ProjectChat schema
projectChatSchema.index({ project: 1, createdAt: -1 });
projectChatSchema.index({ 'messages.timestamp': -1 });
```

## Security Best Practices

1. **Always verify project membership**
   ```javascript
   const isMember = project.teamMembers.some(id => id.equals(req.user._id));
   ```

2. **Validate message content**
   ```javascript
   if (!content || content.length > 5000) {
     return res.status(400).json({ message: 'Invalid content' });
   }
   ```

3. **Check authorization for status updates**
   ```javascript
   if (!['admin', 'hr'].includes(req.user.role)) {
     return res.status(403).json({ message: 'Unauthorized' });
   }
   ```

4. **Rate limit message posting**
   ```javascript
   // Add per-user rate limiting for messages
   const recentMessages = chat.messages.filter(m => 
     m.sender.equals(req.user._id) &&
     new Date() - new Date(m.timestamp) < 1000 // Last 1 second
   );
   if (recentMessages.length > 5) {
     return res.status(429).json({ message: 'Too many messages' });
   }
   ```

## Related Resources

- **Frontend Component**: `src/components/ProjectChat.tsx`
- **Project List**: `src/components/EnhancedProjectManagement.tsx`
- **API Service**: `src/services/api.ts`
- **Socket Service**: `src/services/socket.ts`
- **Backend Routes**: `backend/routes/projectChat.js`
- **Data Model**: `backend/models/ProjectChat.js`
- **Server Setup**: `backend/server.js`

## Troubleshooting Guide

### Debug Socket Connection
```javascript
// In browser console
io.engine.on('error', (error) => {
  console.error('Socket error:', error);
});

io.on('new-project-message', (data) => {
  console.log('Message received:', data);
});
```

### Check Project Membership
```javascript
const project = await Project.findById(projectId)
  .populate('teamMembers', 'firstName lastName');
console.log('Team members:', project.teamMembers);
console.log('Is current user member?', 
  project.teamMembers.some(m => m._id.equals(userId)));
```

### Verify Message Saved
```javascript
const chat = await ProjectChat.findOne({ project: projectId });
console.log('Total messages:', chat.messages.length);
console.log('Last message:', chat.messages[chat.messages.length - 1]);
```

---

**For questions or issues**, refer to the main `PROJECT_CHATROOM_GUIDE.md` file or contact the development team.

**Last Updated**: December 2024
**Version**: 1.0
