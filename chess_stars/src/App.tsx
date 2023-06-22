import React from 'react'
import './App.css'
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import {createBrowserRouter, Link, RouterProvider} from 'react-router-dom'
import ChessGamePage from './pages/ChessGame'
import AuthPage from './pages/Auth';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthPage />,
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
