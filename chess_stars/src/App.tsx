import React from 'react'
import './App.css'
import {createBrowserRouter, Link, RouterProvider} from 'react-router-dom'
import ChessGamePage from './pages/ChessGame'

const router = createBrowserRouter([
  {
    path: '/',
    element: <div><Link to={`/chessboard`}>Открой шахматную доску</Link></div>,
  },
  {
    path: '/chessboard',
    element: <ChessGamePage />,
  },
])

const App = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
