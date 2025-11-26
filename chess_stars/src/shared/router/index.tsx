import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import AuthPage from '../../pages/Auth'
import ProtectedRoute from './ProtectedRoute'
import MainPage from '../../pages/Main/MainPage'
import ChessGamePage from '../../pages/ChessGame'
import { TrainerDashboard } from '../../pages/TrainerDashboard/TrainerDashboard'
import { StudentDashboard } from '../../pages/StudentDashboard/StudentDashboard'
import { VirtualClassroom } from '../../pages/VirtualClassroom/VirtualClassroom'
import { StudentProfile } from '../../pages/StudentProfile/StudentProfile'

const Navigator = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chessboard"
          element={
            <ProtectedRoute>
              <ChessGamePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute>
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student-profile"
          element={
            <ProtectedRoute>
              <StudentProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lesson/:lessonId"
          element={
            <ProtectedRoute>
              <VirtualClassroom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default Navigator
