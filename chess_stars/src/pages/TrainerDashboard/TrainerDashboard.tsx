import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  Alert,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPlus,
  faVideo,
  faEdit,
  faCalendar,
  faClock,
  faUsers,
  faCheckSquare,
} from '@fortawesome/free-solid-svg-icons'
import './TrainerDashboardStyles.css'
import Api from '../../shared/api'

interface Lesson {
  id: string
  title: string
  description: string
  type: 'individual' | 'group'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  scheduledAt: string
  durationMinutes: number
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

interface Student {
  id: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
}

export const TrainerDashboard: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [myStudents, setMyStudents] = useState<Student[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'individual' as 'individual' | 'group',
    scheduledAt: '',
    durationMinutes: 60,
    participantIds: [] as string[],
  })

  useEffect(() => {
    fetchLessons()
    fetchMyStudents()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: '/lessons',
          method: 'GET',
        },
      })

      if (response?.data) {
        setLessons(response.data)
      } else {
        setError('Failed to load lessons')
      }
    } catch (err: any) {
      console.error('Error fetching lessons:', err)
      setError(err?.response?.data?.message || 'Network error loading lessons')
    }
  }

  const fetchMyStudents = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: '/users/my-students',
          method: 'GET',
        },
      })

      if (response?.data) {
        setMyStudents(response.data)
      } else {
        console.log('No students yet or error loading students')
        setMyStudents([])
      }
    } catch (err: any) {
      console.error('Error fetching students:', err)
      setMyStudents([])
    } finally {
      setLoading(false)
    }
  }

  const createLesson = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: '/lessons',
          method: 'POST',
          data: newLesson,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      })

      if (response?.data) {
        await fetchLessons()
        setShowCreateModal(false)
        setNewLesson({
          title: '',
          description: '',
          type: 'individual',
          scheduledAt: '',
          durationMinutes: 60,
          participantIds: [],
        })
      }
    } catch (err: any) {
      console.error('Error creating lesson:', err)
      setError(err?.response?.data?.message || 'Failed to create lesson')
    }
  }

  const startLesson = async (lessonId: string) => {
    try {
      await Api.callAction({
        config: {
          url: `/lessons/${lessonId}/start`,
          method: 'POST',
        },
      })

      // Redirect to virtual classroom
      window.location.href = `/lesson/${lessonId}`
    } catch (err: any) {
      console.error('Error starting lesson:', err)
      setError(err?.response?.data?.message || 'Failed to start lesson')
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setNewLesson((prev) => ({
      ...prev,
      participantIds: prev.participantIds.includes(studentId)
        ? prev.participantIds.filter((id) => id !== studentId)
        : [...prev.participantIds, studentId],
    }))
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

  const getStudentDisplayName = (student: Student) => {
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`
    }
    return student.username
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
    <Container fluid className="trainer-dashboard">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Trainer Dashboard</h2>
              <p className="text-muted">Manage your students and lessons</p>
            </div>
            <Button
              variant="success"
              onClick={() => setShowCreateModal(true)}
              disabled={myStudents.length === 0}
            >
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Lesson
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Debug Info */}
      <Row className="mb-4">
        <Col>
          <Alert variant="info">
            <h6>Debug Info:</h6>
            <p>
              Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
            </p>
            <p>Role: {localStorage.getItem('userRole')}</p>
            <p>User ID: {localStorage.getItem('userId')}</p>
            <p>Students loaded: {myStudents.length}</p>
            <p>Lessons loaded: {lessons.length}</p>
          </Alert>
        </Col>
      </Row>

      {/* Students Summary */}
      <Row className="mb-4">
        <Col>
          <Card className="students-summary">
            <Card.Header>
              <h5>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Your Students ({myStudents.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {myStudents.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">You don't have any students yet.</p>
                  <p className="small">
                    Students can choose you as their trainer in their profile
                    page.
                  </p>
                </div>
              ) : (
                <Row>
                  {myStudents.map((student) => (
                    <Col key={student.id} md={3} lg={2} className="mb-2">
                      <div className="student-card">
                        <div className="student-avatar">
                          {student.avatar ? (
                            <img src={student.avatar} alt="Student" />
                          ) : (
                            <div className="default-avatar">
                              {getStudentDisplayName(student)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="student-name">
                          <small>{getStudentDisplayName(student)}</small>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Lessons */}
      <Row>
        {lessons.length === 0 ? (
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <h5>No lessons scheduled yet</h5>
                {myStudents.length === 0 ? (
                  <p>
                    First, you need students to choose you as their trainer.
                  </p>
                ) : (
                  <p>Create your first lesson with your students!</p>
                )}
                {myStudents.length > 0 && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    Create Lesson
                  </Button>
                )}
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
                  <p className="text-muted small">{lesson.description}</p>

                  <div className="lesson-info">
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
                      <small>{lesson.durationMinutes} min</small>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="me-2 text-muted"
                      />
                      <small>{lesson.participants.length} participants</small>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    {lesson.status === 'scheduled' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => startLesson(lesson.id)}
                      >
                        <FontAwesomeIcon icon={faVideo} className="me-1" />
                        Start
                      </Button>
                    )}

                    {lesson.status === 'in_progress' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/lesson/${lesson.id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faVideo} className="me-1" />
                        Join
                      </Button>
                    )}

                    <Button variant="outline-secondary" size="sm">
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Create Lesson Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Lesson</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={newLesson.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLesson({ ...newLesson, title: e.target.value })
                    }
                    placeholder="Enter lesson title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Lesson Type</Form.Label>
                  <Form.Select
                    value={newLesson.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setNewLesson({
                        ...newLesson,
                        type: e.target.value as 'individual' | 'group',
                      })
                    }
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Group</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newLesson.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewLesson({ ...newLesson, description: e.target.value })
                }
                placeholder="Describe the lesson content"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date and Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newLesson.scheduledAt}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLesson({
                        ...newLesson,
                        scheduledAt: e.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Duration (minutes)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newLesson.durationMinutes}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewLesson({
                        ...newLesson,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    min="15"
                    max="480"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Select Students</Form.Label>
              <div className="student-selection">
                {myStudents.length === 0 ? (
                  <p className="text-muted">
                    No students available. Students need to choose you as their
                    trainer first.
                  </p>
                ) : (
                  <Row>
                    {myStudents.map((student) => (
                      <Col key={student.id} md={6} className="mb-2">
                        <div
                          className={`student-option ${
                            newLesson.participantIds.includes(student.id)
                              ? 'selected'
                              : ''
                          }`}
                          onClick={() => toggleStudentSelection(student.id)}
                        >
                          <div className="d-flex align-items-center">
                            <FontAwesomeIcon
                              icon={faCheckSquare}
                              className={`me-2 ${
                                newLesson.participantIds.includes(student.id)
                                  ? 'text-success'
                                  : 'text-muted'
                              }`}
                            />
                            <div className="student-avatar-small me-2">
                              {student.avatar ? (
                                <img src={student.avatar} alt="Student" />
                              ) : (
                                <div className="default-avatar-small">
                                  {getStudentDisplayName(student)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="student-name">
                                {getStudentDisplayName(student)}
                              </div>
                              <small className="text-muted">
                                @{student.username}
                              </small>
                            </div>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={createLesson}
            disabled={
              !newLesson.title ||
              !newLesson.scheduledAt ||
              newLesson.participantIds.length === 0
            }
          >
            Create Lesson
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
