import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import io, { Socket } from 'socket.io-client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faComments,
  faUsers,
  faArrowLeft,
  faStop,
} from '@fortawesome/free-solid-svg-icons'
import './VirtualClassroomStyles.css'
import Api from '../../shared/api'

interface Participant {
  userId: string
  username: string
  role: string
}

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: string
}

export const VirtualClassroom: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const [game, setGame] = useState(new Chess())
  const [gamePosition, setGamePosition] = useState('start')

  // WebRTC and media
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  )
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)

  // Socket and room
  const socketRef = useRef<Socket | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Lesson state
  const [lessonData, setLessonData] = useState<any>(null)
  const [isTrainer, setIsTrainer] = useState(false)
  const [lessonStatus, setLessonStatus] = useState('scheduled')

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map())

  useEffect(() => {
    initializeRoom()
    return cleanup
  }, [lessonId])

  const initializeRoom = async () => {
    try {
      // Get user data and lesson info
      const userResponse = await Api.callAction({
        config: {
          url: `auth/profile`,
        },
      })
      const user = userResponse.data
      setCurrentUser(user)
      setIsTrainer(user.role === 'trainer')

      const lessonResponse = await Api.callAction({
        config: {
          url: `lessons/${lessonId}`,
        },
      })
      const lesson = lessonResponse.data
      setLessonData(lesson)
      setLessonStatus(lesson.status)

      // Initialize media
      await initializeMedia()

      // Initialize socket
      initializeSocket(user, lesson.roomId)
    } catch (error) {
      console.error('Error initializing room:', error)
    }
  }

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
    }
  }

  const initializeSocket = (user: any, roomId: string) => {
    socketRef.current = io('http://localhost:3001')

    // Join room
    socketRef.current.emit('join-room', {
      roomId,
      userId: user.userId,
      username: user.username,
      role: user.role,
    })

    // Socket event listeners
    socketRef.current.on('participant-joined', (participant: Participant) => {
      console.log('Participant joined:', participant)
      setParticipants((prev) => {
        // Avoid duplicates
        const exists = prev.find((p) => p.userId === participant.userId)
        if (!exists) {
          // Initiate WebRTC connection for new participant
          if (participant.userId !== user.userId) {
            console.log(
              'Creating peer connection as initiator for:',
              participant.userId,
            )
            setTimeout(
              () => createPeerConnection(participant.userId, true),
              1000,
            )
          }
          return [...prev, participant]
        }
        return prev
      })
    })

    socketRef.current.on(
      'participant-left',
      (participant: { userId: string }) => {
        setParticipants((prev) =>
          prev.filter((p) => p.userId !== participant.userId),
        )
        // Clean up peer connection
        const pc = peerConnections.current.get(participant.userId)
        if (pc) {
          pc.close()
          peerConnections.current.delete(participant.userId)
        }
        setRemoteStreams((prev) => {
          const newMap = new Map(prev)
          newMap.delete(participant.userId)
          return newMap
        })
      },
    )

    socketRef.current.on(
      'room-participants',
      (participantList: Participant[]) => {
        console.log('Room participants received:', participantList)
        const otherParticipants = participantList.filter(
          (p) => p.userId !== user.userId,
        )
        setParticipants(otherParticipants)

        // Create peer connections for existing participants
        otherParticipants.forEach((participant) => {
          console.log(
            'Creating peer connection for existing participant:',
            participant.userId,
          )
          setTimeout(() => createPeerConnection(participant.userId, false), 500)
        })
      },
    )

    socketRef.current.on('chess-move', ({ gameState }) => {
      setGame(new Chess(gameState.fen))
      setGamePosition(gameState.fen)
    })

    socketRef.current.on('game-state-update', (gameState) => {
      setGame(new Chess(gameState.fen))
      setGamePosition(gameState.fen)
    })

    socketRef.current.on('chat-message', (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message])
    })

    // WebRTC signaling
    socketRef.current.on('offer', async ({ offer, fromUserId }) => {
      await handleOffer(offer, fromUserId)
    })

    socketRef.current.on('answer', async ({ answer, fromUserId }) => {
      const pc = peerConnections.current.get(fromUserId)
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socketRef.current.on('ice-candidate', async ({ candidate, fromUserId }) => {
      const pc = peerConnections.current.get(fromUserId)
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })
  }

  const createPeerConnection = (userId: string, isInitiator: boolean) => {
    console.log(
      `Creating peer connection for ${userId}, isInitiator: ${isInitiator}`,
    )

    // Check if peer connection already exists
    if (peerConnections.current.has(userId)) {
      console.log(`Peer connection for ${userId} already exists`)
      return peerConnections.current.get(userId)
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    })

    // Add local stream
    if (localStream) {
      console.log('Adding local stream tracks to peer connection')
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream)
      })
    } else {
      console.warn('No local stream available when creating peer connection')
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream from', userId)
      const [remoteStream] = event.streams
      setRemoteStreams((prev) => {
        const newMap = new Map(prev)
        newMap.set(userId, remoteStream)
        return newMap
      })
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && lessonData?.roomId) {
        console.log('Sending ICE candidate to', userId)
        socketRef.current.emit('ice-candidate', {
          roomId: lessonData.roomId,
          candidate: event.candidate,
          targetUserId: userId,
        })
      }
    }

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Peer connection state for ${userId}:`, pc.connectionState)
    }

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, pc.iceConnectionState)
    }

    peerConnections.current.set(userId, pc)

    if (isInitiator && lessonData?.roomId) {
      // Create offer
      console.log('Creating offer for', userId)
      pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      })
        .then((offer) => {
          return pc.setLocalDescription(offer)
        })
        .then(() => {
          if (socketRef.current) {
            console.log('Sending offer to', userId)
            socketRef.current.emit('offer', {
              roomId: lessonData.roomId,
              offer: pc.localDescription,
              targetUserId: userId,
            })
          }
        })
        .catch((error) => {
          console.error('Error creating offer:', error)
        })
    }

    return pc
  }

  const handleOffer = async (
    offer: RTCSessionDescriptionInit,
    fromUserId: string,
  ) => {
    console.log('Received offer from', fromUserId)
    try {
      const pc = createPeerConnection(fromUserId, false)
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        if (socketRef.current && lessonData?.roomId) {
          console.log('Sending answer to', fromUserId)
          socketRef.current.emit('answer', {
            roomId: lessonData.roomId,
            answer,
            targetUserId: fromUserId,
          })
        }
      }
    } catch (error) {
      console.error('Error handling offer:', error)
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      })

      if (move === null) return false

      const newPosition = game.fen()
      setGamePosition(newPosition)

      // Broadcast move to other participants
      if (socketRef.current) {
        socketRef.current.emit('chess-move', {
          roomId: lessonData?.roomId,
          move,
          gameState: { fen: newPosition, history: game.history() },
        })
      }

      return true
    } catch (error) {
      return false
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const sendChatMessage = () => {
    if (newMessage.trim() && socketRef.current && currentUser) {
      socketRef.current.emit('chat-message', {
        roomId: lessonData?.roomId,
        message: newMessage,
        userId: currentUser.userId,
        username: currentUser.username,
      })
      setNewMessage('')
    }
  }

  const endLesson = async () => {
    if (isTrainer && lessonId) {
      try {
        await Api.callAction({
          config: {
            url: `lessons/${lessonId}/end`,
            method: 'POST',
          },
        })
        setLessonStatus('completed')
      } catch (error) {
        console.error('Error ending lesson:', error)
      }
    }
  }

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    peerConnections.current.forEach((pc) => pc.close())
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }

  if (!lessonData) {
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
    <div className="virtual-classroom">
      <Container fluid>
        {/* Header */}
        <Row className="classroom-header">
          <Col>
            <div className="d-flex justify-content-between align-items-center p-3">
              <div className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-3"
                  onClick={() => window.history.back()}
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </Button>
                <h5 className="mb-0">{lessonData.title}</h5>
                <Badge bg="success" className="ms-2">
                  {lessonStatus}
                </Badge>
              </div>

              <div className="d-flex align-items-center gap-2">
                <Button
                  variant={isAudioEnabled ? 'success' : 'danger'}
                  size="sm"
                  onClick={toggleAudio}
                >
                  <FontAwesomeIcon
                    icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
                  />
                </Button>

                <Button
                  variant={isVideoEnabled ? 'success' : 'danger'}
                  size="sm"
                  onClick={toggleVideo}
                >
                  <FontAwesomeIcon
                    icon={isVideoEnabled ? faVideo : faVideoSlash}
                  />
                </Button>

                {isTrainer && lessonStatus === 'in_progress' && (
                  <Button variant="warning" size="sm" onClick={endLesson}>
                    <FontAwesomeIcon icon={faStop} className="me-1" />
                    Завершить
                  </Button>
                )}
              </div>
            </div>
          </Col>
        </Row>

        {/* Main content */}
        <Row className="classroom-content">
          {/* Left panel - Video feeds */}
          <Col xl={2} lg={3} md={4} className="video-panel">
            <Card className="h-100">
              <Card.Header>
                <FontAwesomeIcon icon={faUsers} className="me-2" />
                Участники ({participants.length + 1})
              </Card.Header>
              <Card.Body className="p-2">
                {/* Local video */}
                <div className="video-container mb-2">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="participant-video"
                  />
                  <div className="video-overlay">
                    <small>{currentUser?.username} (Вы)</small>
                  </div>
                </div>

                {/* Remote videos */}
                {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                  const participant = participants.find(
                    (p) => p.userId === userId,
                  )
                  return (
                    <div key={userId} className="video-container mb-2">
                      <video
                        autoPlay
                        playsInline
                        className="participant-video"
                        ref={(video) => {
                          if (video) video.srcObject = stream
                        }}
                      />
                      <div className="video-overlay">
                        <small>{participant?.username}</small>
                      </div>
                    </div>
                  )
                })}

                {/* Show placeholders for participants without video */}
                {participants
                  .filter((p) => !remoteStreams.has(p.userId))
                  .map((participant) => (
                    <div
                      key={`placeholder-${participant.userId}`}
                      className="video-container mb-2 video-placeholder"
                    >
                      <div className="participant-video d-flex align-items-center justify-content-center bg-secondary">
                        <FontAwesomeIcon
                          icon={faUsers}
                          size="lg"
                          className="text-white"
                        />
                      </div>
                      <div className="video-overlay">
                        <small>{participant.username} (Connecting...)</small>
                      </div>
                    </div>
                  ))}
              </Card.Body>
            </Card>
          </Col>

          {/* Center - Chess board */}
          <Col xl={7} lg={6} md={8} className="chess-panel">
            <Card className="h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <span>Шахматная доска</span>
                  {isTrainer && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        const newGame = new Chess()
                        setGame(newGame)
                        setGamePosition(newGame.fen())
                        if (socketRef.current) {
                          socketRef.current.emit('game-state-update', {
                            roomId: lessonData?.roomId,
                            gameState: { fen: newGame.fen(), history: [] },
                          })
                        }
                      }}
                    >
                      Сброс доски
                    </Button>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="d-flex justify-content-center align-items-center p-2">
                <div className="chess-board-container">
                  <Chessboard
                    position={gamePosition}
                    onPieceDrop={onDrop}
                    boardWidth={Math.min(
                      500,
                      Math.max(280, window.innerWidth * 0.45),
                    )}
                    arePiecesDraggable={true}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right panel - Chat */}
          <Col xl={3} lg={3} md={12} className="chat-panel">
            <Card className="h-100">
              <Card.Header>
                <FontAwesomeIcon icon={faComments} className="me-2" />
                Чат
              </Card.Header>
              <Card.Body className="d-flex flex-column p-0">
                <div className="chat-messages flex-grow-1 p-2">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="chat-message mb-2">
                      <strong>{msg.username}: </strong>
                      <span>{msg.message}</span>
                      <small className="text-muted d-block">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </small>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-muted p-3">
                      <FontAwesomeIcon
                        icon={faComments}
                        size="2x"
                        className="mb-2"
                      />
                      <p className="mb-0">No messages yet</p>
                      <small>Start the conversation!</small>
                    </div>
                  )}
                </div>

                <div className="chat-input p-2 border-top">
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Введите сообщение..."
                      value={newMessage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setNewMessage(e.target.value)
                      }
                      onKeyPress={(
                        e: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (e.key === 'Enter') {
                          sendChatMessage()
                        }
                      }}
                    />
                    <Button
                      variant="primary"
                      onClick={sendChatMessage}
                      disabled={!newMessage.trim()}
                    >
                      <FontAwesomeIcon icon={faComments} />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
