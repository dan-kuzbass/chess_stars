# Chess Stars - Next.js Frontend

This is the Next.js frontend for the Chess Stars application, a chess coaching platform that allows trainers and students to conduct virtual chess lessons with video communication and interactive chess boards.

## Features

- **Authentication**: Separate login flows for trainers and students
- **Dashboard**: Role-specific dashboards with relevant information
- **Lesson Management**: Create, schedule, and join chess lessons
- **Virtual Classroom**: Real-time video, audio, and chess board interaction
- **Profile Management**: User profile customization and trainer assignment
- **Chess Practice**: Standalone chess board for practice

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: React Bootstrap
- **Styling**: CSS Modules and Global CSS
- **Chess Engine**: chess.js
- **Chess Board**: react-chessboard
- **Real-time Communication**: Socket.IO
- **WebRTC**: Browser WebRTC APIs for video/audio

## Project Structure

```
app/
  ├── api/                 # API route handlers
  ├── auth/                # Authentication pages
  ├── chessboard/          # Chess practice page
  ├── student-dashboard/   # Student dashboard
  ├── student-profile/     # Student profile management
  ├── trainer-dashboard/   # Trainer dashboard
  ├── virtual-classroom/   # Virtual classroom for lessons
  ├── layout.tsx          # Root layout with protected routes
  └── page.tsx            # Home page redirecting to auth
components/
  └── ProtectedRoute.tsx  # Route protection component
lib/
  └── api.ts             # API client utilities
styles/
  └── globals.css        # Global styles
types/
  └── (TypeScript types)
```

## Getting Started

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Run the development server**:

   ```bash
   npm run dev
   ```

3. **Build for production**:

   ```bash
   npm run build
   ```

4. **Start production server**:
   ```bash
   npm start
   ```

## Environment Variables

The application expects the backend to be running on `http://localhost:3001`. This is configured in the API client.

## Key Components

### Authentication

- Role-based login (trainer/student)
- Token-based authentication
- Protected route system

### Dashboards

- **Student Dashboard**: View assigned lessons and available trainer lessons
- **Trainer Dashboard**: Manage students and create lessons

### Virtual Classroom

- Real-time video/audio communication using WebRTC
- Interactive chess board with move validation
- Chat functionality
- Lesson management (start/end)

### API Integration

- RESTful API communication with the NestJS backend
- Automatic token handling for authenticated requests
- Error handling and user feedback

## Development Notes

- Uses React Server Components where appropriate
- Implements proper TypeScript typing
- Responsive design for all device sizes
- Real-time communication with Socket.IO
- WebRTC for peer-to-peer video/audio

## Backend Integration

This frontend is designed to work with the NestJS backend located in the `backend/` directory of the project. Make sure the backend is running on port 3001 for proper API communication.
