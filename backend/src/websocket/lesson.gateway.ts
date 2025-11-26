import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface RoomData {
  participants: Map<string, { userId: string; username: string; role: string }>;
  gameState?: any;
  trainerId?: string;
}

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class LessonGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LessonGateway.name);
  private rooms: Map<string, RoomData> = new Map();
  private userSockets: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Найти и удалить пользователя из комнат
    for (const [roomId, room] of this.rooms.entries()) {
      for (const [socketId, participant] of room.participants.entries()) {
        if (socketId === client.id) {
          room.participants.delete(socketId);
          this.userSockets.delete(participant.userId);

          // Уведомить других участников о выходе
          client.to(roomId).emit('participant-left', {
            userId: participant.userId,
            username: participant.username,
          });

          // Если комната пуста, удалить её
          if (room.participants.size === 0) {
            this.rooms.delete(roomId);
          }
          break;
        }
      }
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody()
    data: { roomId: string; userId: string; username: string; role: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, userId, username, role } = data;

    client.join(roomId);
    this.userSockets.set(userId, client);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        participants: new Map(),
        trainerId: role === 'trainer' ? userId : undefined,
      });
    }

    const room = this.rooms.get(roomId);
    room.participants.set(client.id, { userId, username, role });

    // Уведомить других участников о присоединении
    client.to(roomId).emit('participant-joined', {
      userId,
      username,
      role,
    });

    // Отправить текущий список участников новому пользователю
    const participants = Array.from(room.participants.values());
    client.emit('room-participants', participants);

    // Если есть текущее состояние игры, отправить его новому участнику
    if (room.gameState) {
      client.emit('game-state-update', room.gameState);
    }

    this.logger.log(`User ${username} joined room ${roomId}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      const participant = room.participants.get(client.id);
      if (participant) {
        room.participants.delete(client.id);
        this.userSockets.delete(participant.userId);

        client.to(roomId).emit('participant-left', {
          userId: participant.userId,
          username: participant.username,
        });

        if (room.participants.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }

    client.leave(roomId);
    this.logger.log(`User left room ${roomId}`);
  }

  @SubscribeMessage('chess-move')
  handleChessMove(
    @MessageBody() data: { roomId: string; move: any; gameState: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, move, gameState } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      room.gameState = gameState;

      // Отправить ход всем участникам кроме отправителя
      client.to(roomId).emit('chess-move', {
        move,
        gameState,
      });
    }
  }

  @SubscribeMessage('game-state-update')
  handleGameStateUpdate(
    @MessageBody() data: { roomId: string; gameState: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, gameState } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      room.gameState = gameState;

      // Отправить обновление всем участникам
      this.server.to(roomId).emit('game-state-update', gameState);
    }
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(
    @MessageBody()
    data: { roomId: string; message: string; userId: string; username: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, message, userId, username } = data;

    // Отправить сообщение всем участникам комнаты
    this.server.to(roomId).emit('chat-message', {
      message,
      userId,
      username,
      timestamp: new Date().toISOString(),
    });
  }

  // WebRTC signaling
  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { roomId: string; offer: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, offer, targetUserId } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      const senderParticipant = room.participants.get(client.id);
      const targetSocket = this.userSockets.get(targetUserId);

      if (targetSocket && senderParticipant) {
        targetSocket.emit('offer', {
          offer,
          fromUserId: senderParticipant.userId,
          fromUsername: senderParticipant.username,
        });
      }
    }
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { roomId: string; answer: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, answer, targetUserId } = data;
    const targetSocket = this.userSockets.get(targetUserId);

    if (targetSocket) {
      const room = this.rooms.get(roomId);
      const senderParticipant = room?.participants.get(client.id);

      targetSocket.emit('answer', {
        answer,
        fromUserId: senderParticipant?.userId,
      });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody()
    data: { roomId: string; candidate: any; targetUserId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, candidate, targetUserId } = data;
    const targetSocket = this.userSockets.get(targetUserId);

    if (targetSocket) {
      const room = this.rooms.get(roomId);
      const senderParticipant = room?.participants.get(client.id);

      targetSocket.emit('ice-candidate', {
        candidate,
        fromUserId: senderParticipant?.userId,
      });
    }
  }

  @SubscribeMessage('trainer-annotation')
  handleTrainerAnnotation(
    @MessageBody() data: { roomId: string; annotation: any },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, annotation } = data;
    const room = this.rooms.get(roomId);

    if (room) {
      const participant = room.participants.get(client.id);

      // Только тренер может отправлять аннотации
      if (participant?.role === 'trainer') {
        client.to(roomId).emit('trainer-annotation', annotation);
      }
    }
  }
}
