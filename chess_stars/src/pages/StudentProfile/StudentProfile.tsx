import React, { useState, useEffect } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Alert,
  Badge,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUser,
  faChalkboardTeacher,
  faCheckCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import './StudentProfileStyles.css'
import Api from '../../shared/api'

interface Trainer {
  id: string
  username: string
  firstName?: string
  lastName?: string
  bio?: string
  avatar?: string
}

interface StudentProfile {
  id: string
  username: string
  firstName?: string
  lastName?: string
  role: string
  trainer?: Trainer
}

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [availableTrainers, setAvailableTrainers] = useState<Trainer[]>([])
  const [showTrainerModal, setShowTrainerModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
    loadAvailableTrainers()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'users/profile',
        },
      })

      console.log('fdfd rees', response)

      if (response.data) {
        const data = response.data
        setProfile(data)
      } else {
        setError('Failed to load profile')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const loadAvailableTrainers = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'users/trainers',
          method: 'GET',
        },
      })

      if (response.data) {
        setAvailableTrainers(response.data)
      }
    } catch (err) {
      console.error('Failed to load trainers:', err)
    } finally {
      setLoading(false)
    }
  }

  const assignTrainer = async (trainerId: string) => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'users/assign-trainer',
          method: 'POST',
          body: { trainerId },
        },
      })

      if (response.data) {
        setSuccess('Trainer assigned successfully!')
        setShowTrainerModal(false)
        await loadProfile() // Reload profile to show new trainer
      } else {
        setError('Failed to assign trainer')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const removeTrainer = async () => {
    try {
      const response = await Api.callAction({
        config: {
          url: 'users/remove-trainer',
          method: 'DELETE',
        },
      })

      if (response.data) {
        setSuccess('Trainer removed successfully!')
        await loadProfile()
      } else {
        setError('Failed to remove trainer')
      }
    } catch (err) {
      setError('Network error')
    }
  }

  const getTrainerDisplayName = (trainer: Trainer) => {
    if (trainer.firstName && trainer.lastName) {
      return `${trainer.firstName} ${trainer.lastName}`
    }
    return trainer.username
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
    <Container className="student-profile">
      <Row className="mb-4">
        <Col>
          <h2>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Student Profile
          </h2>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={6}>
          <Card className="profile-card">
            <Card.Header>
              <h5>Your Information</h5>
            </Card.Header>
            <Card.Body>
              <div className="profile-info">
                <p>
                  <strong>Username:</strong> {profile?.username}
                </p>
                {profile?.firstName && (
                  <p>
                    <strong>Name:</strong> {profile.firstName}{' '}
                    {profile.lastName}
                  </p>
                )}
                <p>
                  <strong>Role:</strong> <Badge bg="info">Student</Badge>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="trainer-card">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5>
                <FontAwesomeIcon icon={faChalkboardTeacher} className="me-2" />
                Your Trainer
              </h5>
              {!profile?.trainer && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowTrainerModal(true)}
                >
                  Choose Trainer
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {profile?.trainer ? (
                <div className="trainer-info">
                  <div className="d-flex align-items-center mb-3">
                    <div className="trainer-avatar me-3">
                      {profile.trainer.avatar ? (
                        <img
                          src={profile.trainer.avatar}
                          alt="Trainer"
                          className="rounded-circle"
                        />
                      ) : (
                        <div className="default-avatar">
                          {getTrainerDisplayName(profile.trainer)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h6 className="mb-1">
                        {getTrainerDisplayName(profile.trainer)}
                      </h6>
                      <p className="text-muted mb-0">
                        @{profile.trainer.username}
                      </p>
                    </div>
                  </div>

                  {profile.trainer.bio && (
                    <p className="trainer-bio">{profile.trainer.bio}</p>
                  )}

                  <div className="trainer-actions">
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={removeTrainer}
                    >
                      <FontAwesomeIcon icon={faTimesCircle} className="me-1" />
                      Remove Trainer
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => setShowTrainerModal(true)}
                    >
                      Change Trainer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="no-trainer">
                  <p className="text-muted">
                    You haven't selected a trainer yet.
                  </p>
                  <p className="small">
                    Choose a trainer to start taking lessons!
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Trainer Selection Modal */}
      <Modal
        show={showTrainerModal}
        onHide={() => setShowTrainerModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Choose Your Trainer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            {availableTrainers.map((trainer) => (
              <Col md={6} key={trainer.id} className="mb-3">
                <Card className="trainer-option h-100">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <div className="trainer-avatar-small me-3">
                        {trainer.avatar ? (
                          <img
                            src={trainer.avatar}
                            alt="Trainer"
                            className="rounded-circle"
                          />
                        ) : (
                          <div className="default-avatar-small">
                            {getTrainerDisplayName(trainer)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h6 className="mb-1">
                          {getTrainerDisplayName(trainer)}
                        </h6>
                        <p className="text-muted small mb-0">
                          @{trainer.username}
                        </p>
                      </div>
                    </div>

                    {trainer.bio && (
                      <p className="small trainer-bio-preview">{trainer.bio}</p>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-100"
                      onClick={() => assignTrainer(trainer.id)}
                      disabled={profile?.trainer?.id === trainer.id}
                    >
                      {profile?.trainer?.id === trainer.id ? (
                        <>
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="me-1"
                          />
                          Current Trainer
                        </>
                      ) : (
                        'Select This Trainer'
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {availableTrainers.length === 0 && (
            <div className="text-center p-4">
              <p className="text-muted">No trainers available at the moment.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowTrainerModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}
