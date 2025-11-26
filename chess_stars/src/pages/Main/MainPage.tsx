import React, { useEffect } from 'react'
import {
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBIcon,
  MDBContainer,
  MDBRow,
  MDBCol,
} from 'mdb-react-ui-kit'
import { useNavigate } from 'react-router-dom'
import './MainPageStyles.css'

const MainPage = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check user role and redirect appropriately
    const checkUserRoleAndRedirect = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          navigate('/auth')
          return
        }

        const response = await fetch('http://localhost:3001/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response) {
          const user = await response.json()

          // Redirect based on role
          if (user.role === 'trainer') {
            navigate('/trainer-dashboard')
          } else if (user.role === 'student') {
            navigate('/student-dashboard')
          }
          // If admin or other roles, stay on main page
        } else {
          localStorage.removeItem('token')
          navigate('/auth')
        }
      } catch (error) {
        console.error('Error checking user role:', error)
        localStorage.removeItem('token')
        navigate('/auth')
      }
    }

    checkUserRoleAndRedirect()
  }, [navigate])

  const handleToGame = () => {
    navigate('/chessboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    navigate('/auth')
  }

  const features = [
    {
      icon: 'chess-board',
      title: 'Play Chess',
      description: 'Start a new game and practice your skills',
      action: handleToGame,
      color: 'primary' as const,
    },
    {
      icon: 'puzzle-piece',
      title: 'Solve Puzzles',
      description: 'Challenge yourself with tactical problems',
      action: () => console.log('Puzzles coming soon'),
      color: 'success' as const,
    },
    {
      icon: 'graduation-cap',
      title: 'Lessons',
      description: 'Learn from structured chess lessons',
      action: () => console.log('Lessons coming soon'),
      color: 'warning' as const,
    },
    {
      icon: 'chart-line',
      title: 'Progress',
      description: 'Track your improvement over time',
      action: () => console.log('Progress coming soon'),
      color: 'info' as const,
    },
  ]

  const recentActivity = [
    {
      type: 'game',
      description: 'Completed training game',
      time: '2 hours ago',
    },
    {
      type: 'puzzle',
      description: 'Solved 5 tactical puzzles',
      time: '1 day ago',
    },
    {
      type: 'lesson',
      description: 'Finished opening principles',
      time: '3 days ago',
    },
  ]

  return (
    <div className="main-page">
      {/* Header */}
      <header className="main-header">
        <MDBContainer>
          <div className="header-content">
            <div className="brand-section">
              <MDBIcon fas icon="chess-knight" className="brand-icon" />
              <h1 className="brand-title">Chess Stars</h1>
            </div>

            <div className="user-section">
              <div className="user-info">
                <MDBIcon fas icon="user-circle" className="user-avatar" />
                <span className="user-name">Welcome, Player!</span>
              </div>
              <MDBBtn
                color="light"
                size="sm"
                onClick={handleLogout}
                className="logout-btn"
              >
                <MDBIcon fas icon="sign-out-alt" className="me-2" />
                Logout
              </MDBBtn>
            </div>
          </div>
        </MDBContainer>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <MDBContainer>
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-content">
              <h2 className="welcome-title">Ready to Master Chess?</h2>
              <p className="welcome-subtitle">
                Choose from various training options to improve your chess
                skills
              </p>
            </div>
          </section>

          {/* Features Grid */}
          <section className="features-section">
            <MDBRow className="g-4">
              {features.map((feature, index) => (
                <MDBCol key={index} md="6" lg="3">
                  <MDBCard
                    className="feature-card h-100"
                    onClick={feature.action}
                  >
                    <MDBCardBody className="text-center">
                      <div className={`feature-icon-wrapper ${feature.color}`}>
                        <MDBIcon
                          fas
                          icon={feature.icon}
                          className="feature-icon"
                        />
                      </div>
                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">
                        {feature.description}
                      </p>
                      <MDBBtn
                        color={feature.color}
                        size="sm"
                        className="feature-btn"
                      >
                        Get Started
                        <MDBIcon fas icon="arrow-right" className="ms-2" />
                      </MDBBtn>
                    </MDBCardBody>
                  </MDBCard>
                </MDBCol>
              ))}
            </MDBRow>
          </section>

          {/* Stats and Activity */}
          <MDBRow className="mt-5 g-4">
            {/* Quick Stats */}
            <MDBCol lg="4">
              <MDBCard className="stats-card">
                <MDBCardBody>
                  <h5 className="card-title">
                    <MDBIcon fas icon="trophy" className="me-2 text-warning" />
                    Your Stats
                  </h5>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-number">12</div>
                      <div className="stat-label">Games Played</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">85%</div>
                      <div className="stat-label">Puzzle Accuracy</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">1250</div>
                      <div className="stat-label">Current Rating</div>
                    </div>
                    <div className="stat-item">
                      <div className="stat-number">7</div>
                      <div className="stat-label">Lessons Completed</div>
                    </div>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>

            {/* Recent Activity */}
            <MDBCol lg="8">
              <MDBCard className="activity-card">
                <MDBCardBody>
                  <h5 className="card-title">
                    <MDBIcon fas icon="clock" className="me-2 text-primary" />
                    Recent Activity
                  </h5>
                  <div className="activity-list">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <MDBIcon
                            fas
                            icon={
                              activity.type === 'game'
                                ? 'chess-board'
                                : activity.type === 'puzzle'
                                ? 'puzzle-piece'
                                : 'book-open'
                            }
                          />
                        </div>
                        <div className="activity-content">
                          <div className="activity-description">
                            {activity.description}
                          </div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-center mt-4">
                    <MDBBtn color="primary" size="sm">
                      View All Activity
                    </MDBBtn>
                  </div>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <MDBCard className="quick-actions-card">
              <MDBCardBody>
                <div className="quick-actions-content">
                  <div className="quick-actions-text">
                    <h4>Ready for a Challenge?</h4>
                    <p>
                      Jump into a training game and put your skills to the test!
                    </p>
                  </div>
                  <MDBBtn
                    color="primary"
                    size="lg"
                    onClick={handleToGame}
                    className="quick-action-btn"
                  >
                    <MDBIcon fas icon="play" className="me-2" />
                    Start Training Game
                  </MDBBtn>
                </div>
              </MDBCardBody>
            </MDBCard>
          </section>
        </MDBContainer>
      </main>
    </div>
  )
}

export default MainPage
