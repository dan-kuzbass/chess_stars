import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faVideo,
  faCalendar,
  faClock,
  faUsers,
  faUser,
  faChess,
} from '@fortawesome/free-solid-svg-icons'
import './StudentDashboardStyles.css'
import Api from '../../shared/api'

interface Lesson {
  id: string
  title: string
  description: string
  type: 'individual' | 'group'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledAt: string
  durationMinutes: number
  trainer: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  participants: Array<{
    id: string
    user: {
      id: string
      username: string
    }
    status: string
  }>
  roomId?: string
}

export const StudentDashboard: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetchUserAndLessons()
  }, [])

  const fetchUserAndLessons = async () => {
    try {
      // Get current user info
      const userResponse = await Api.callAction({
        config: {
          url: 'auth/profile',
        },
      })

      if (userResponse.data) {
        const user = userResponse.data
        console.log('Current user data:', user)
        setCurrentUser(user)

        // Fetch student's assigned lessons
        await fetchLessons()

        // If student has a trainer, fetch trainer's active lessons
        if (user.trainerId) {
          console.log('User has trainer with ID:', user.trainerId)
          await fetchTrainerActiveLessons(user.trainerId)
        } else {
          console.log('User does not have a trainer assigned')
        }
      }
    } catch (err) {
      setError('Failed to load user information')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'lessons',
          method: 'GET',
        },
      })

      if (response.data) {
        setLessons(response.data)
      } else {
        setError('Failed to load lessons')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const fetchTrainerActiveLessons = async (trainerId: string) => {
    try {
      console.log('Fetching trainer active lessons for trainer:', trainerId)
      // Fetch all lessons from the student's trainer that are active
      const response = await Api.callAction({
        config: {
          url: `lessons/trainer/${trainerId}/active`,
          method: 'GET',
        },
      })

      console.log('Trainer active lessons response:', response.status)
      if (response.data) {
        const data = response.data
        console.log('Trainer active lessons data:', data)
        setAvailableLessons(data)
      } else {
        const errorText = response.data.error
        console.log('Error fetching trainer active lessons:', errorText)
      }
    } catch (err) {
      console.error('Error fetching trainer active lessons:', err)
    }
  }

  const joinLesson = async (lessonId: string) => {
    try {
      await Api.callAction({
        config: {
          url: `lessons/${lessonId}/join`,
          method: 'POST',
        },
      })

      // Redirect to virtual classroom
      window.location.href = `/lesson/${lessonId}`
    } catch (err) {
      setError('Failed to join lesson')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary'
      case 'in_progress':
        return 'success'
      case 'completed':
        return 'secondary'
      case 'cancelled':
        return 'danger'
      default:
        return 'light'
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU')
  }

  const getTrainerDisplayName = (trainer: any) => {
    if (trainer.firstName && trainer.lastName) {
      return `${trainer.firstName} ${trainer.lastName}`
    }
    return trainer.username
  }

  const isLessonJoinable = (lesson: Lesson) => {
    return lesson.status === 'scheduled' || lesson.status === 'in_progress'
  }

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: '400px' }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    )
  }

  return (
    <Container fluid className="student-dashboard">
      <Row className="mb-4">
        <Col>
          <div className="dashboard-header">
            <h2>
              <FontAwesomeIcon icon={faChess} className="me-3" />
              Student Dashboard
            </h2>
            <p className="text-muted">Your upcoming and past chess lessons</p>
          </div>
        </Col>
      </Row>

      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="action-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faUser} className="action-icon mb-2" />
              <h6>Trainer Profile</h6>
              <p className="text-muted small">Manage your trainer selection</p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => (window.location.href = '/student-profile')}
              >
                View Profile
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="action-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faCalendar} className="action-icon mb-2" />
              <h6>Scheduled Lessons</h6>
              <p className="text-muted small">
                {lessons.filter((l) => l.status === 'scheduled').length}{' '}
                upcoming
              </p>
              <Badge bg="primary">
                {lessons.filter((l) => l.status === 'scheduled').length}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="action-card">
            <Card.Body className="text-center">
              <FontAwesomeIcon icon={faUsers} className="action-icon mb-2" />
              <h6>Completed Lessons</h6>
              <p className="text-muted small">
                {lessons.filter((l) => l.status === 'completed').length}{' '}
                completed
              </p>
              <Badge bg="success">
                {lessons.filter((l) => l.status === 'completed').length}
              </Badge>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Active Lessons */}
      {currentUser?.trainerId && (
        <>
          <Row>
            <Col>
              <h4 className="mb-3">
                <FontAwesomeIcon icon={faVideo} className="me-2 text-success" />
                Active Lessons You Can Join
                {availableLessons.length === 0 && (
                  <Badge bg="secondary" className="ms-2">
                    No active lessons
                  </Badge>
                )}
              </h4>
            </Col>
          </Row>
          {availableLessons.length > 0 ? (
            <Row className="mb-4">
              {availableLessons.map((lesson) => (
                <Col
                  key={`available-${lesson.id}`}
                  md={6}
                  lg={4}
                  className="mb-3"
                >
                  <Card className="lesson-card h-100 border-success">
                    <Card.Header className="d-flex justify-content-between align-items-center bg-light-success">
                      <h6 className="mb-0">{lesson.title}</h6>
                      <Badge bg="success" className="pulse">
                        {lesson.status === 'in_progress'
                          ? 'LIVE'
                          : lesson.status}
                      </Badge>
                    </Card.Header>
                    <Card.Body>
                      <div className="lesson-details mb-3">
                        <p className="text-muted mb-2">{lesson.description}</p>

                        <div className="d-flex align-items-center mb-2">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="me-2 text-muted"
                          />
                          <small>
                            Trainer: {getTrainerDisplayName(lesson.trainer)}
                          </small>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FontAwesomeIcon
                            icon={faCalendar}
                            className="me-2 text-muted"
                          />
                          <small>{formatDateTime(lesson.scheduledAt)}</small>
                        </div>

                        <div className="d-flex align-items-center mb-2">
                          <FontAwesomeIcon
                            icon={faClock}
                            className="me-2 text-muted"
                          />
                          <small>{lesson.durationMinutes} minutes</small>
                        </div>
                      </div>
                    </Card.Body>
                    <Card.Footer>
                      <Button
                        variant={
                          lesson.status === 'in_progress'
                            ? 'success'
                            : 'primary'
                        }
                        size="sm"
                        className="w-100"
                        onClick={() => joinLesson(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faVideo} className="me-1" />
                        {lesson.status === 'in_progress'
                          ? 'Join Live Lesson'
                          : 'Join Lesson'}
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row className="mb-4">
              <Col>
                <Card className="text-center p-3">
                  <Card.Body>
                    <FontAwesomeIcon
                      icon={faVideo}
                      className="mb-3"
                      size="2x"
                      color="#6c757d"
                    />
                    <h6>No Active Lessons Available</h6>
                    <p className="text-muted">
                      Your trainer hasn't started any lessons yet. Active
                      lessons will appear here when they become available.
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}

      {/* Your Assigned Lessons */}
      <Row>
        <Col>
          <h4 className="mb-3">Your Scheduled Lessons</h4>
        </Col>
      </Row>

      <Row>
        {lessons.length === 0 ? (
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <FontAwesomeIcon
                  icon={faCalendar}
                  className="mb-3"
                  size="3x"
                  color="#6c757d"
                />
                <h5>No lessons scheduled yet</h5>
                <p>
                  Make sure you have selected a trainer in your profile. Your
                  trainer will create lessons for you.
                </p>
                <Button
                  variant="primary"
                  onClick={() => (window.location.href = '/student-profile')}
                >
                  <FontAwesomeIcon icon={faUser} className="me-2" />
                  Select Trainer
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          lessons.map((lesson) => (
            <Col key={lesson.id} md={6} lg={4} className="mb-4">
              <Card className="lesson-card h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{lesson.title}</h6>
                  <Badge bg={getStatusColor(lesson.status)}>
                    {lesson.status}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <div className="lesson-details mb-3">
                    <p className="text-muted mb-2">{lesson.description}</p>

                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="me-2 text-muted"
                      />
                      <small>
                        Trainer: {getTrainerDisplayName(lesson.trainer)}
                      </small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon
                        icon={faCalendar}
                        className="me-2 text-muted"
                      />
                      <small>{formatDateTime(lesson.scheduledAt)}</small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="me-2 text-muted"
                      />
                      <small>{lesson.durationMinutes} minutes</small>
                    </div>

                    <div className="d-flex align-items-center mb-2">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="me-2 text-muted"
                      />
                      <small>
                        {lesson.type === 'individual' ? 'Individual' : 'Group'}(
                        {lesson.participants.length} participant
                        {lesson.participants.length !== 1 ? 's' : ''})
                      </small>
                    </div>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex gap-2">
                    {isLessonJoinable(lesson) && (
                      <Button
                        variant={
                          lesson.status === 'in_progress'
                            ? 'success'
                            : 'primary'
                        }
                        size="sm"
                        onClick={() => joinLesson(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faVideo} className="me-1" />
                        {lesson.status === 'in_progress' ? 'Join Now' : 'Join'}
                      </Button>
                    )}

                    {lesson.status === 'completed' && (
                      <Button variant="outline-secondary" size="sm" disabled>
                        Completed
                      </Button>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  )
}
