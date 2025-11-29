# Project Chatroom Feature Guide

## Overview

The HR system includes a fully functional **Project Chatroom** feature that enables team members on the same project to collaborate in real-time. Team members can:
- Send messages and updates
- Update project status and progress
- View team participation
- Track status changes with progress indicators

## Architecture

### Backend Components

#### 1. **ProjectChat Model** (`backend/models/ProjectChat.js`)
- Stores chat messages and metadata
- Fields:
  - `project`: Reference to the Project
  - `messages`: Array of message objects with:
    - `sender`: User reference
    - `content`: Message text
    - `messageType`: 'message', 'status_update', or 'file_share'
    - `statusUpdate`: Object tracking status changes with old/new status and progress
    - `timestamp`: When message was sent
    - `readBy`: Array tracking read receipts
  - `participants`: Team members with access
  - `isActive`: Boolean flag for archival

#### 2. **Project Chat Routes** (`backend/routes/projectChat.js`)

**GET /api/project-chat/:projectId**
- Retrieves chat for a specific project
- Auto-creates chat if doesn't exist
- Requires project membership
- Returns messages and participants

**POST /api/project-chat/:projectId/message**
- Sends a new message or status update
- Automatically updates project status if status update
- Emits real-time notification via Socket.io
- Message types:
  - `message`: Regular text message
  - `status_update`: Project status change with progress
  - `file_share`: Future enhancement for file sharing

### Frontend Components

#### 1. **ProjectChat Component** (`src/components/ProjectChat.tsx`)
- Modal dialog for team chat
- Features:
  - Real-time message display
  - Auto-scroll to latest messages
  - Team member avatars and info
  - Status update special formatting with progress bars
  - Time-stamped messages

#### 2. **EnhancedProjectManagement Component** (`src/components/EnhancedProjectManagement.tsx`)
- Displays projects in grid/list view
- Includes "Team Chat" button (message icon) on each project card
- Opens ProjectChat modal when clicked
- Manages project lifecycle and team assignments

### Real-Time Features

#### Socket.io Integration (`backend/server.js`)
```javascript
// Project room management
socket.on('join-project', (projectId) => {
  socket.join(`project-${projectId}`);
});

socket.on('leave-project', (projectId) => {
  socket.leave(`project-${projectId}`);
});

// Broadcast new messages to all team members
io.to(`project-${projectId}`).emit('new-project-message', {
  projectId: projectId,
  message: messageData
});
```

#### Socket Service (`src/services/socket.ts`)
- Manages socket connections
- Listens for `new-project-message` events
- Auto-updates UI when new messages arrive

## User Flow

### Accessing Project Chat

1. **Navigate to Projects**
   - Go to Projects section in main menu
   - View all projects as grid or list

2. **Open Team Chat**
   - Click the message icon (💬) on any project card
   - This opens the ProjectChat modal

3. **Send Messages**
   - Type in the message input field
   - Press Enter or click Send button
   - Message appears instantly for all team members

4. **Update Status**
   - Click "Update Status" button in modal header
   - Select new status (planning, active, on-hold, completed)
   - Set progress percentage (0-100)
   - Click "Update" to broadcast status change
   - Status update appears as blue highlighted message

### Message Types

#### Regular Messages
- Appear in gray box
- Show sender name, avatar, and timestamp
- Stored in database

#### Status Updates
- Special formatting with blue background and border
- Shows status icon (activity, check mark, clock)
- Displays progress bar if progress > 0
- Automatically updates project status in database
- Example: "Updated project status to active"

## Access Control

### Who Can Access Project Chat?
- **Project Team Members**: Listed in `project.teamMembers`
- **Project Manager**: Defined in `project.projectManager`
- **Project Creator**: Defined in `project.createdBy`

### Who Can Update Status?
- Only HR/Admin roles can update project status
- Based on authorization middleware in projectChat routes

## API Integration

The feature uses the centralized API service (`src/services/api.ts`) with generic methods:

```typescript
// Get chat
api.get(`/project-chat/${projectId}`)

// Send message
api.post(`/project-chat/${projectId}/message`, {
  content: 'message text',
  messageType: 'message'
})

// Send status update
api.post(`/project-chat/${projectId}/message`, {
  content: 'Updated project status to active',
  messageType: 'status_update',
  statusUpdate: {
    newStatus: 'active',
    progress: 75
  }
})
```

## Features Implemented

✅ **Real-time Messaging**
- WebSocket via Socket.io
- Instant message delivery
- Auto-scroll to latest

✅ **Status Updates**
- Project status change tracking
- Progress indicator display
- Auto-update project document

✅ **Team Collaboration**
- Multiple participants per chat
- Sender identification with avatars
- Timestamp tracking

✅ **Access Control**
- Team member verification
- Role-based status update permissions
- Project membership requirement

✅ **Message Types**
- Regular messages
- Status update messages (with progress)
- System messages (extensible)

## Testing the Feature

### Prerequisites
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB connection active
- User logged in with project team member role

### Test Steps

1. **Create a Test Project**
   - Click "New Project" button
   - Fill in project details
   - Add team members
   - Submit

2. **Open Project Chat**
   - Click message icon on project card
   - Modal should open with project title

3. **Test Regular Message**
   - Type "Hello team!"
   - Press Enter
   - Message should appear with your name and timestamp
   - All team members should see it in real-time

4. **Test Status Update**
   - Click "Update Status" button
   - Select "Active"
   - Set progress to 50%
   - Click "Update"
   - Status message should appear with progress bar

5. **Verify Persistence**
   - Refresh page
   - Reopen project chat
   - All messages should still be there

## Database Schema

### ProjectChat Document
```javascript
{
  _id: ObjectId,
  project: ObjectId,  // Reference to Project
  messages: [
    {
      sender: ObjectId,  // Reference to User
      content: String,
      messageType: String,  // 'message' | 'status_update' | 'file_share'
      statusUpdate: {
        oldStatus: String,
        newStatus: String,
        progress: Number
      },
      timestamp: Date,
      readBy: [
        {
          user: ObjectId,
          readAt: Date
        }
      ]
    }
  ],
  participants: [ObjectId],  // Array of User IDs
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Future Enhancements

1. **File Sharing**
   - Implement `file_share` message type
   - Store file references and metadata
   - Preview file attachments in UI

2. **Message Reactions**
   - Add emoji reactions to messages
   - Count reactions per message

3. **Message Search**
   - Search through chat history
   - Filter by message type or date range

4. **Typing Indicators**
   - Show when team member is typing
   - "User X is typing..." display

5. **Read Receipts**
   - Show when messages are read
   - Display reader avatars

6. **Message Editing**
   - Allow users to edit their sent messages
   - Track edit history

7. **Thread Replies**
   - Reply to specific messages
   - Create conversation threads

8. **Scheduled Messages**
   - Schedule status updates in advance
   - Reminders for important updates

## Troubleshooting

### Chat Not Loading
- Verify user is a project team member
- Check MongoDB connection
- Check browser console for errors

### Status Update Not Changing Project
- Verify user has admin/hr role
- Check authorization middleware
- Look at server logs for validation errors

### Real-time Messages Not Appearing
- Verify Socket.io connection in browser DevTools
- Check that both users are in `project-{projectId}` room
- Verify backend server is running

### Messages Not Persisting
- Check MongoDB connection
- Verify ProjectChat collection exists
- Check write permissions

## Security Considerations

1. **Authentication Required**
   - JWT token validation on all endpoints
   - Token passed in Authorization header

2. **Authorization Checks**
   - Project membership verification before chat access
   - Role-based status update permissions
   - Creator/Manager-only actions

3. **Input Validation**
   - Content length limits
   - Message type enum validation
   - Project ID existence check

4. **Rate Limiting**
   - Server-wide rate limit: 100 requests/15 minutes
   - Consider per-user chat limits for spam prevention

## Performance Notes

- Messages indexed by `project` and `createdAt` for faster queries
- Pagination support (can be added to load older messages)
- Avatar caching recommended on frontend
- Consider archiving old chats to reduce database size

## Related Files

- `backend/models/ProjectChat.js` - Data model
- `backend/routes/projectChat.js` - API endpoints
- `src/components/ProjectChat.tsx` - Chat UI component
- `src/components/EnhancedProjectManagement.tsx` - Project list with chat integration
- `src/services/socket.ts` - WebSocket client
- `backend/server.js` - Socket.io server setup

---

**Last Updated**: December 2024
**Version**: 1.0
**Status**: ✅ Production Ready
