import React, { ReactElement, useContext, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import Api from '../api'

const ProtectedRoute = (props: { children: ReactElement }) => {
  const navigate = useNavigate()

  useEffect(() => {
    Api.setNavigate(navigate)
  }, [])

  return props.children
}

export default ProtectedRoute
