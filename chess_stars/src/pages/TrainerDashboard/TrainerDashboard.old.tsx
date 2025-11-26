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

export const TrainerDashboard: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'individual' as 'individual' | 'group',
    scheduledAt: '',
    durationMinutes: 60,
    participantUsernames: [] as string[],
  })

  useEffect(() => {
    fetchLessons()
  }, [])

  const fetchLessons = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'lessons',
        },
      })

      if (response.data) {
        const data = await response.data.json()
        setLessons(data)
      } else {
        setError('Failed to load lessons')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const createLesson = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'lessons',
          body: JSON.stringify(newLesson),
          method: 'POST',
        },
      })

      if (response.data) {
        await fetchLessons()
        setShowCreateModal(false)
        setNewLesson({
          title: '',
          description: '',
          type: 'individual',
          scheduledAt: '',
          durationMinutes: 60,
          participantUsernames: [],
        })
      } else {
        setError('Failed to create lesson')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const startLesson = async (lessonId: string) => {
    try {
      await Api.callAction({
        config: {
          url: `lessons/${lessonId}/start`,
          method: 'POST',
        },
      })

      // Redirect to virtual classroom
      window.location.href = `/lesson/${lessonId}`
    } catch (err) {
      setError('Failed to start lesson')
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
            <h2>Панель тренера</h2>
            <Button variant="success" onClick={() => setShowCreateModal(true)}>
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Создать занятие
            </Button>
          </div>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        {lessons.length === 0 ? (
          <Col>
            <Card className="text-center p-5">
              <Card.Body>
                <h5>Пока нет запланированных занятий</h5>
                <p>Создайте свое первое занятие, чтобы начать обучение!</p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="me-2" />
                  Создать занятие
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
                      <small>{lesson.durationMinutes} мин</small>
                    </div>

                    <div className="d-flex align-items-center mb-3">
                      <FontAwesomeIcon
                        icon={faUsers}
                        className="me-2 text-muted"
                      />
                      <small>{lesson.participants.length} участников</small>
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
                        Начать
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
                        Войти
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
          <Modal.Title>Создать новое занятие</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Название занятия</Form.Label>
                  <Form.Control
                    type="text"
                    value={newLesson.title}
                    onChange={(e) =>
                      setNewLesson({ ...newLesson, title: e.target.value })
                    }
                    placeholder="Введите название"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Тип занятия</Form.Label>
                  <Form.Select
                    value={newLesson.type}
                    onChange={(e) =>
                      setNewLesson({
                        ...newLesson,
                        type: e.target.value as 'individual' | 'group',
                      })
                    }
                  >
                    <option value="individual">Индивидуальное</option>
                    <option value="group">Групповое</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Описание</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newLesson.description}
                onChange={(e) =>
                  setNewLesson({ ...newLesson, description: e.target.value })
                }
                placeholder="Опишите содержание занятия"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Дата и время</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={newLesson.scheduledAt}
                    onChange={(e) =>
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
                  <Form.Label>Продолжительность (мин)</Form.Label>
                  <Form.Control
                    type="number"
                    value={newLesson.durationMinutes}
                    onChange={(e) =>
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
              <Form.Label>Участники (usernames через запятую)</Form.Label>
              <Form.Control
                type="text"
                placeholder="user1, user2, user3"
                onChange={(e) => {
                  const usernames = e.target.value
                    .split(',')
                    .map((u) => u.trim())
                    .filter((u) => u)
                  setNewLesson({
                    ...newLesson,
                    participantUsernames: usernames,
                  })
                }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Отмена
          </Button>
          <Button variant="primary" onClick={createLesson}>
            Создать занятие
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
