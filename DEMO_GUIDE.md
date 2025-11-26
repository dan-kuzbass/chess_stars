# Chess Stars Trainer Platform - Demo Guide

## 🚀 Quick Start Guide

### Prerequisites

- Backend running on http://localhost:3001
- Frontend running on http://localhost:3000 (or another available port)

### 📋 Step-by-Step Demo

#### 1. Create a Trainer Account

1. Go to http://localhost:3000/auth
2. Enter credentials:
   - **Username**: `trainer1`
   - **Password**: `password123`
   - **Role**: Select "Trainer" ✅
3. Click "Sign In"
4. You'll be redirected to the Trainer Dashboard

#### 2. Create a Lesson

1. In the Trainer Dashboard, click "Create Lesson"
2. Fill in the lesson details:
   - **Title**: "Chess Basics - Opening Principles"
   - **Type**: Individual or Group
   - **Description**: "Learning fundamental opening principles"
   - **Date & Time**: Choose any future date/time
   - **Duration**: 60 minutes
   - **Participants**: `student1, student2` (comma-separated usernames)
3. Click "Create Lesson"

#### 3. Create Student Accounts

Open a new incognito/private browser window:

1. Go to http://localhost:3000/auth
2. Create first student:
   - **Username**: `student1`
   - **Password**: `password123`
   - **Role**: Select "Student" ✅
3. Sign in and note the interface difference

Repeat for `student2` in another incognito window.

#### 4. Start a Lesson

1. As trainer, click "Start" button on the created lesson
2. You'll enter the Virtual Classroom with:
   - ✅ Video feed (allow camera/microphone access)
   - ✅ Shared chess board
   - ✅ Real-time chat
   - ✅ Participant list

#### 5. Join as Student

1. Students can join by going to the lesson URL or being invited
2. They'll see the same virtual classroom
3. Everyone can:
   - Make moves on the shared board
   - Chat in real-time
   - See each other via video

### 🎯 Key Features to Test

#### Video Communication

- Toggle microphone on/off
- Toggle camera on/off
- Multiple participants with WebRTC

#### Interactive Chess Board

- Make moves (synchronized across all participants)
- Trainer can reset the board
- Real-time position updates

#### Real-time Chat

- Send messages during lessons
- See participant join/leave notifications
- Timestamps on all messages

#### Lesson Management

- Create different types of lessons (individual/group)
- Manage participants
- Start/end lessons
- Track lesson status

### 🔧 Technical Architecture

```
Frontend (React + TypeScript)
├── Authentication with roles
├── Trainer Dashboard
├── Virtual Classroom
├── WebRTC Video/Audio
└── Socket.IO Real-time

Backend (NestJS + TypeORM)
├── JWT Authentication
├── User Management (Trainer/Student roles)
├── Lesson Management
├── WebSocket Gateway
└── SQLite Database

Real-time Features
├── Socket.IO for chat and notifications
├── WebRTC for peer-to-peer video
├── Synchronized chess board
└── Live participant management
```

### 🎮 Demo Scenarios

#### Scenario 1: Individual Lesson

- Trainer creates 1-on-1 lesson
- Single student joins
- Practice specific positions
- Analyze moves together

#### Scenario 2: Group Lesson

- Trainer creates group lesson
- Multiple students join
- Demonstrate opening principles
- Students can ask questions via chat

#### Scenario 3: Advanced Features

- Screen sharing capabilities
- Game state management
- Recording functionality (placeholder)
- Lesson history and progress tracking

### 🐛 Troubleshooting

#### Common Issues:

1. **Camera/Microphone not working**: Check browser permissions
2. **WebRTC connection issues**: Ensure both users are on the same network or use STUN servers
3. **Socket connection problems**: Verify backend is running on port 3001
4. **Database issues**: SQLite database will be auto-created on first run

#### Browser Compatibility:

- ✅ Chrome/Chromium (recommended)
- ✅ Firefox
- ✅ Safari (with limitations)
- ❌ Internet Explorer

### 🚀 Production Deployment

For production deployment, you would need to:

1. Configure proper STUN/TURN servers for WebRTC
2. Use PostgreSQL or MySQL instead of SQLite
3. Implement proper SSL/HTTPS
4. Add user registration and email verification
5. Implement payment processing for lessons
6. Add advanced features like recording, screen sharing, etc.

### 🎯 Next Steps

The platform is fully functional for conducting chess lessons with video communication. You can extend it with:

- Payment integration
- Advanced chess analysis tools
- Lesson recording and playback
- Student progress tracking
- Calendar integration
- Mobile app support
