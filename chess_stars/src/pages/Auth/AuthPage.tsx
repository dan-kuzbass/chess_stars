import React, { useState } from 'react'
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBRow,
  MDBCol,
  MDBIcon,
  MDBInput,
  MDBSpinner,
} from 'mdb-react-ui-kit'
import { useNavigate } from 'react-router-dom'
import Api from '../../shared/api'
import './AuthPageStyles.css'

const AuthPage = () => {
  const [isLoad, setIsLoad] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')

  const navigate = useNavigate()

  const handleClick = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsLoad(true)
    setError('')

    try {
      const res = await Api.callAction({
        config: {
          url: 'auth/login',
          method: 'POST',
          data: { username, password, role },
        },
      })

      localStorage.setItem('token', res?.data?.access_token)
      localStorage.setItem('accessToken', res?.data?.access_token)
      localStorage.setItem('userRole', res?.data?.user?.role)
      localStorage.setItem('userId', res?.data?.user?.id)

      // Navigate based on role
      if (res?.data?.user?.role === 'trainer') {
        navigate('/trainer-dashboard')
      } else {
        navigate('/student-profile')
      }
    } catch (e: any) {
      console.error(e)
      setError(e?.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoad(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleClick()
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="chess-pattern"></div>
      </div>

      <MDBContainer className="auth-container">
        <MDBRow className="justify-content-center align-items-center min-vh-100">
          <MDBCol lg="10" xl="8">
            <MDBCard className="auth-card">
              <MDBRow className="g-0">
                <MDBCol md="6" className="auth-image-section">
                  <div className="auth-image-content">
                    <div className="brand-section">
                      <MDBIcon fas icon="chess-knight" className="brand-icon" />
                      <h1 className="brand-title">Chess Stars</h1>
                      <p className="brand-subtitle">
                        Master the art of chess with professional training
                      </p>
                    </div>

                    <div className="features-list">
                      <div className="feature-item">
                        <MDBIcon
                          fas
                          icon="graduation-cap"
                          className="feature-icon"
                        />
                        <span>Learn from expert coaches</span>
                      </div>
                      <div className="feature-item">
                        <MDBIcon fas icon="users" className="feature-icon" />
                        <span>Interactive training sessions</span>
                      </div>
                      <div className="feature-item">
                        <MDBIcon
                          fas
                          icon="chart-line"
                          className="feature-icon"
                        />
                        <span>Track your progress</span>
                      </div>
                      <div className="feature-item">
                        <MDBIcon fas icon="trophy" className="feature-icon" />
                        <span>Compete and improve</span>
                      </div>
                    </div>
                  </div>
                </MDBCol>

                <MDBCol md="6">
                  <MDBCardBody className="auth-form-section">
                    <div className="form-header">
                      <h2 className="form-title">Welcome Back</h2>
                      <p className="form-subtitle">
                        Sign in to continue your chess journey
                      </p>
                    </div>

                    <form
                      className="auth-form"
                      onSubmit={(e) => e.preventDefault()}
                    >
                      {error && (
                        <div className="error-message">
                          <MDBIcon
                            fas
                            icon="exclamation-triangle"
                            className="me-2"
                          />
                          {error}
                        </div>
                      )}

                      <div className="form-group">
                        <MDBInput
                          label="Username or Email"
                          id="username"
                          type="text"
                          size="lg"
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          onKeyPress={handleKeyPress}
                          className="form-input"
                          disabled={isLoad}
                        />
                      </div>

                      <div className="form-group">
                        <MDBInput
                          label="Password"
                          id="password"
                          type="password"
                          size="lg"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          onKeyPress={handleKeyPress}
                          className="form-input"
                          disabled={isLoad}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Role</label>
                        <div className="role-selection">
                          <div className="role-option">
                            <input
                              type="radio"
                              id="student"
                              name="role"
                              value="student"
                              checked={role === 'student'}
                              onChange={(e) => setRole(e.target.value)}
                              disabled={isLoad}
                            />
                            <label htmlFor="student" className="role-label">
                              <MDBIcon
                                fas
                                icon="user-graduate"
                                className="me-2"
                              />
                              Student
                            </label>
                          </div>
                          <div className="role-option">
                            <input
                              type="radio"
                              id="trainer"
                              name="role"
                              value="trainer"
                              checked={role === 'trainer'}
                              onChange={(e) => setRole(e.target.value)}
                              disabled={isLoad}
                            />
                            <label htmlFor="trainer" className="role-label">
                              <MDBIcon
                                fas
                                icon="chalkboard-teacher"
                                className="me-2"
                              />
                              Trainer
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="form-actions">
                        {isLoad ? (
                          <div className="loading-container">
                            <MDBSpinner className="custom-spinner" />
                            <span className="loading-text">Signing in...</span>
                          </div>
                        ) : (
                          <MDBBtn
                            className="login-btn"
                            size="lg"
                            onClick={handleClick}
                            disabled={!username.trim() || !password.trim()}
                          >
                            <MDBIcon fas icon="sign-in-alt" className="me-2" />
                            Sign In
                          </MDBBtn>
                        )}
                      </div>

                      <div className="form-footer">
                        <p className="signup-text">
                          New to Chess Stars?{' '}
                          <a href="#!" className="signup-link">
                            Contact your coach to get started
                          </a>
                        </p>
                      </div>
                    </form>
                  </MDBCardBody>
                </MDBCol>
              </MDBRow>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  )
}

export default AuthPage
