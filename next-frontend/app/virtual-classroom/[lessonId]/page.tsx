"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import io, { Socket } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faComments,
  faUsers,
  faUser,
  faArrowLeft,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import { api, User, Lesson } from "@/lib/api";

interface Participant {
  userId: string;
  username: string;
  role: string;
}

interface ChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export default function VirtualClassroom() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [game, setGame] = useState(new Chess());
  const [gamePosition, setGamePosition] = useState("start");

  // WebRTC and media
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  // Socket and room
  const socketRef = useRef<Socket | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);

  // Lesson state
  const [lessonData, setLessonData] = useState<Lesson | null>(null);
  const [isTrainer, setIsTrainer] = useState(false);
  const [lessonStatus, setLessonStatus] = useState("scheduled");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  useEffect(() => {
    initializeRoom();
    return cleanup;
  }, [lessonId]);

  const initializeRoom = async () => {
    try {
      // Get user data and lesson info
      const user = await api.getProfile();
      setCurrentUser(user);
      setIsTrainer(user.role === "trainer");

      const response = await fetch(
        `http://localhost:3001/lessons/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load lesson");
      }

      const lesson = await response.json();
      setLessonData(lesson);
      setLessonStatus(lesson.status);

      // Initialize media
      await initializeMedia();

      // Initialize socket
      initializeSocket(user, lesson.roomId);
    } catch (error) {
      console.error("Error initializing room:", error);
    }
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  const initializeSocket = (user: User, roomId: string) => {
    socketRef.current = io("http://localhost:3001");

    // Join room
    socketRef.current.emit("join-room", {
      roomId,
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Socket event listeners
    socketRef.current.on("participant-joined", (participant: Participant) => {
      console.log("Participant joined:", participant);
      setParticipants((prev) => {
        // Avoid duplicates
        const exists = prev.find((p) => p.userId === participant.userId);
        if (!exists) {
          // Initiate WebRTC connection for new participant
          if (participant.userId !== user.id) {
            console.log(
              "Creating peer connection as initiator for:",
              participant.userId
            );
            setTimeout(
              () => createPeerConnection(participant.userId, true),
              1000
            );
          }
          return [...prev, participant];
        }
        return prev;
      });
    });

    socketRef.current.on(
      "participant-left",
      (participant: { userId: string }) => {
        setParticipants((prev) =>
          prev.filter((p) => p.userId !== participant.userId)
        );
        // Clean up peer connection
        const pc = peerConnections.current.get(participant.userId);
        if (pc) {
          pc.close();
          peerConnections.current.delete(participant.userId);
        }
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(participant.userId);
          return newMap;
        });
      }
    );

    socketRef.current.on(
      "room-participants",
      (participantList: Participant[]) => {
        console.log("Room participants received:", participantList);
        const otherParticipants = participantList.filter(
          (p) => p.userId !== user.id
        );
        setParticipants(otherParticipants);

        // Create peer connections for existing participants
        otherParticipants.forEach((participant) => {
          console.log(
            "Creating peer connection for existing participant:",
            participant.userId
          );
          setTimeout(
            () => createPeerConnection(participant.userId, false),
            1000
          );
        });
      }
    );

    // WebRTC signaling
    socketRef.current.on(
      "offer",
      async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
        console.log("Received offer from:", data.from);
        const pc = peerConnections.current.get(data.from);
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socketRef.current?.emit("answer", {
              to: data.from,
              answer: pc.localDescription,
            });
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        }
      }
    );

    socketRef.current.on(
      "answer",
      async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        console.log("Received answer from:", data.from);
        const pc = peerConnections.current.get(data.from);
        if (pc) {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
          } catch (error) {
            console.error("Error handling answer:", error);
          }
        }
      }
    );

    socketRef.current.on(
      "ice-candidate",
      async (data: {
        from: string;
        candidate: RTCIceCandidateInit;
      }) => {
        console.log("Received ICE candidate from:", data.from);
        const pc = peerConnections.current.get(data.from);
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      }
    );

    // Chat messages
    socketRef.current.on(
      "chat-message",
      (message: ChatMessage) => {
        setChatMessages((prev) => [...prev, message]);
      }
    );

    // Game moves
    socketRef.current.on(
      "game-move",
      (move: { from: string; to: string }) => {
        setGame((prevGame) => {
          const newGame = new Chess(prevGame.fen());
          try {
            newGame.move({
              from: move.from,
              to: move.to,
              promotion: "q",
            });
            setGamePosition(newGame.fen());
            return newGame;
          } catch (e) {
            console.error("Invalid move:", e);
            return prevGame;
          }
        });
      }
    );
  };

  const createPeerConnection = async (userId: string, isInitiator: boolean) => {
    console.log("Creating peer connection for:", userId, "initiator:", isInitiator);

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle incoming remote stream
    pc.ontrack = (event) => {
      console.log("Received remote track from:", userId);
      const stream = event.streams[0];
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, stream);
        return newMap;
      });
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          to: userId,
          candidate: event.candidate,
        });
      }
    };

    // Store peer connection
    peerConnections.current.set(userId, pc);

    // Create offer if initiator
    if (isInitiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketRef.current?.emit("offer", {
          to: userId,
          offer: pc.localDescription,
        });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks[0].enabled = !audioTracks[0].enabled;
        setIsAudioEnabled(audioTracks[0].enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks[0].enabled = !videoTracks[0].enabled;
        setIsVideoEnabled(videoTracks[0].enabled);
      }
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socketRef.current && currentUser) {
      const message: ChatMessage = {
        userId: currentUser.id,
        username: currentUser.username,
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
      socketRef.current.emit("chat-message", message);
      setNewMessage("");
    }
  };

  const makeMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      setGame(gameCopy);
      setGamePosition(gameCopy.fen());

      // Send move to other participants
      if (socketRef.current) {
        socketRef.current.emit("game-move", {
          from: move.from,
          to: move.to,
        });
      }

      return result;
    } catch (e) {
      console.error("Invalid move:", e);
      return null;
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    const move = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: "q",
    });

    return move !== null;
  };

  const endLesson = async () => {
    try {
      await fetch(`http://localhost:3001/lessons/${lessonId}/end`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      router.push(isTrainer ? "/trainer-dashboard" : "/student-dashboard");
    } catch (error) {
      console.error("Error ending lesson:", error);
    }
  };

  const cleanup = () => {
    // Close all peer connections
    peerConnections.current.forEach((pc) => pc.close());
    peerConnections.current.clear();

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-lg font-bold">
              {lessonData?.title || "Virtual Classroom"}
            </h1>
            <p className="text-sm text-gray-400">
              {lessonData?.type === "individual" ? "Individual Lesson" : "Group Lesson"} •{" "}
              {lessonStatus === "in_progress" ? (
                <span className="text-green-400">In Progress</span>
              ) : (
                <span className="text-yellow-400">Starting Soon</span>
              )}
            </p>
          </div>
        </div>

        {isTrainer && lessonStatus === "in_progress" && (
          <button
            onClick={endLesson}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <FontAwesomeIcon icon={faStop} className="mr-2" />
            End Lesson
          </button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Main Content - Video and Chess */}
        <div className="flex-1 flex flex-col">
          {/* Video Area */}
          <div className="flex-1 bg-black p-4">
            <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local Video */}
              <div className="bg-gray-800 rounded-lg overflow-hidden relative">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  You
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={toggleAudio}
                    className={`p-2 rounded-full ${
                      isAudioEnabled ? "bg-indigo-600" : "bg-red-600"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isAudioEnabled ? faMicrophone : faMicrophoneSlash}
                    />
                  </button>
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-full ${
                      isVideoEnabled ? "bg-indigo-600" : "bg-red-600"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={isVideoEnabled ? faVideo : faVideoSlash}
                    />
                  </button>
                </div>
              </div>

              {/* Remote Videos */}
              {Array.from(remoteStreams.entries()).map(([userId, stream]) => {
                const participant = participants.find((p) => p.userId === userId);
                return (
                  <div
                    key={userId}
                    className="bg-gray-800 rounded-lg overflow-hidden relative"
                  >
                    <video
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      ref={(ref) => {
                        if (ref && stream) {
                          ref.srcObject = stream;
                        }
                      }}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                      {participant?.username || "Participant"}
                    </div>
                  </div>
                );
              })}

              {/* Placeholder for empty slots */}
              {remoteStreams.size === 0 && (
                <div className="bg-gray-800 rounded-lg flex items-center justify-center col-span-2">
                  <div className="text-center p-8">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="text-4xl text-gray-600 mb-4"
                    />
                    <p className="text-gray-500 text-lg">
                      Waiting for participants to join...
                    </p>
                    <p className="text-gray-600 mt-2">
                      Share this lesson link with others to invite them
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chess Board */}
          <div className="bg-gray-800 border-t border-gray-700 p-4">
            <div className="max-w-md mx-auto">
              <Chessboard
                position={gamePosition}
                onPieceDrop={onDrop}
                boardOrientation={isTrainer ? "white" : "black"}
                customBoardStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                }}
                customDarkSquareStyle={{ backgroundColor: "#4b5563" }}
                customLightSquareStyle={{ backgroundColor: "#9ca3af" }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar - Participants and Chat */}
        <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setShowChat(true)}
              className={`flex-1 py-3 px-4 text-center ${
                showChat
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faComments} className="mr-2" />
              Chat
            </button>
            <button
              onClick={() => setShowChat(false)}
              className={`flex-1 py-3 px-4 text-center ${
                !showChat
                  ? "border-b-2 border-indigo-500 text-indigo-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="mr-2" />
              Participants ({participants.length + 1})
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {showChat ? (
              <div className="h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-indigo-300">
                          {msg.username}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-200 mt-1 bg-gray-700 p-2 rounded-lg">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <FontAwesomeIcon
                        icon={faComments}
                        className="text-2xl mb-2"
                      />
                      <p>No messages yet</p>
                      <p className="text-xs mt-1">
                        Start a conversation with your classmates
                      </p>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <div className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          sendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`px-4 py-2 rounded-r-lg ${
                        newMessage.trim()
                          ? "bg-indigo-600 hover:bg-indigo-700"
                          : "bg-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                      <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div>
                      <p className="font-medium">
                        {currentUser?.username || "You"}
                      </p>
                      <p className="text-xs text-gray-400">You</p>
                    </div>
                  </div>

                  {participants.map((participant) => (
                    <div
                      key={participant.userId}
                      className="flex items-center p-3 bg-gray-700 rounded-lg"
                    >
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3">
                        <FontAwesomeIcon icon={faUser} />
                      </div>
                      <div>
                        <p className="font-medium">{participant.username}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}