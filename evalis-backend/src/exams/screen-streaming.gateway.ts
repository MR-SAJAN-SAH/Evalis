import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface StreamingSession {
  submissionId: string;
  candidateId: string;
  organizationId: string;
  socket: Socket;
  startedAt: Date;
}

@WebSocketGateway({
  namespace: 'screen-stream',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ScreenStreamingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ScreenStreamingGateway');
  private sessions = new Map<string, StreamingSession>();
  private adminWatchers = new Map<string, Set<string>>(); // submissionId -> Set<adminSocketIds>

  afterInit(server: Server) {
    this.logger.log('✅ WebSocket Gateway initialized for screen streaming');
    this.logger.log(`📡 Listening on namespace: /screen-stream`);
  }

  handleConnection(client: Socket) {
    this.logger.log(`✅ Client connected to /screen-stream: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client disconnected from /screen-stream: ${client.id}`);

    // Remove from streaming sessions if was streaming
    for (const [submissionId, session] of this.sessions.entries()) {
      if (session.socket.id === client.id) {
        this.sessions.delete(submissionId);
        this.logger.log(`Streaming session ended: ${submissionId}`);
        this.server.emit('stream-ended', { submissionId });
      }
    }

    // Remove from watchers
    for (const [submissionId, watchers] of this.adminWatchers.entries()) {
      if (watchers.has(client.id)) {
        watchers.delete(client.id);
        if (watchers.size === 0) {
          this.adminWatchers.delete(submissionId);
        }
      }
    }
  }

  /**
   * Start screen streaming session - called by candidate
   */
  @SubscribeMessage('start-streaming')
  handleStartStreaming(
    client: Socket,
    payload: {
      submissionId: string;
      candidateId: string;
      organizationId: string;
    },
  ) {
    const { submissionId, candidateId, organizationId } = payload;

    this.logger.log(
      `🎬 [start-streaming] Received from candidate ${candidateId}, submission: ${submissionId}, org: ${organizationId}`,
    );

    // Store streaming session
    this.sessions.set(submissionId, {
      submissionId,
      candidateId,
      organizationId,
      socket: client,
      startedAt: new Date(),
    });

    this.logger.log(
      `📡 Streaming started: ${submissionId} by candidate ${candidateId}`,
    );

    client.emit('streaming-started', { submissionId, message: 'Ready to receive frames' });
  }

  /**
   * Receive frame from candidate
   */
  @SubscribeMessage('screen-frame')
  handleScreenFrame(
    client: Socket,
    payload: { submissionId: string; frameData: string; timestamp: number },
  ) {
    const { submissionId, frameData, timestamp } = payload;
    const session = this.sessions.get(submissionId);

    if (!session) {
      this.logger.warn(`⚠️ [screen-frame] No session found for ${submissionId}`);
      return;
    }

    if (session.socket.id !== client.id) {
      this.logger.warn(`⚠️ [screen-frame] Unauthorized frame from ${client.id} for ${submissionId}`);
      return;
    }

    // Get all admins watching this submission
    const watchers = this.adminWatchers.get(submissionId);
    if (watchers && watchers.size > 0) {
      const frameSizeKB = (frameData.length / 1024).toFixed(2);
      this.logger.debug(`📸 Broadcasting frame (${frameSizeKB}KB) to ${watchers.size} admin(s)`);
      
      // Broadcast frame to all watching admins
      for (const adminSocketId of watchers) {
        this.server.to(adminSocketId).emit('screen-frame', {
          submissionId,
          frameData,
          timestamp,
        });
      }
    }
  }

  /**
   * Admin joins to watch a candidate's screen
   */
  @SubscribeMessage('watch-screen')
  handleWatchScreen(
    client: Socket,
    payload: { submissionId: string; organizationId: string },
  ) {
    const { submissionId, organizationId } = payload;
    this.logger.log(
      `👁️ [watch-screen] Admin requesting to watch submission: ${submissionId}, org: ${organizationId}`,
    );
    
    const session = this.sessions.get(submissionId);

    if (!session) {
      this.logger.warn(
        `❌ [watch-screen] No active session found for ${submissionId}. Active sessions: ${Array.from(this.sessions.keys()).join(', ') || 'NONE'}`,
      );
      client.emit('watch-error', {
        submissionId,
        message: 'No active streaming session for this submission',
      });
      return;
    }

    // Verify organization match
    if (session.organizationId !== organizationId) {
      this.logger.warn(
        `❌ [watch-screen] Organization mismatch: session org=${session.organizationId}, request org=${organizationId}`,
      );
      client.emit('watch-error', {
        submissionId,
        message: 'Unauthorized to watch this session',
      });
      return;
    }

    // Add to watchers
    if (!this.adminWatchers.has(submissionId)) {
      this.adminWatchers.set(submissionId, new Set());
    }
    const watchers = this.adminWatchers.get(submissionId);
    if (watchers) {
      watchers.add(client.id);
    }

    client.emit('watching-started', {
      submissionId,
      candidateName: session.candidateId,
      startedAt: session.startedAt,
    });

    // Notify candidate that an admin is watching
    session.socket.emit('admin-watching', {
      submissionId,
      watcherCount: this.adminWatchers.get(submissionId)?.size || 0,
    });

    this.logger.log(`✅ [watch-screen] Admin ${client.id} now watching submission ${submissionId}`);
  }

  /**
   * Admin stops watching
   */
  @SubscribeMessage('stop-watching')
  handleStopWatching(
    client: Socket,
    payload: { submissionId: string },
  ) {
    const { submissionId } = payload;
    const watchers = this.adminWatchers.get(submissionId);

    if (watchers?.has(client.id)) {
      watchers.delete(client.id);
      if (watchers.size === 0) {
        this.adminWatchers.delete(submissionId);
      }
      
      // Notify candidate that admin stopped watching
      const session = this.sessions.get(submissionId);
      if (session) {
        session.socket.emit('admin-stopped-watching', {
          submissionId,
          watcherCount: watchers.size,
        });
      }
      
      this.logger.log(`👁️ Admin ${client.id} stopped watching submission ${submissionId}`);
    }
  }

  /**
   * Stop streaming session - called by candidate
   */
  @SubscribeMessage('stop-streaming')
  handleStopStreaming(
    client: Socket,
    payload: { submissionId: string },
  ) {
    const { submissionId } = payload;
    const session = this.sessions.get(submissionId);

    if (session && session.socket.id === client.id) {
      this.sessions.delete(submissionId);
      
      // Notify all watchers
      const watchers = this.adminWatchers.get(submissionId);
      if (watchers) {
        for (const adminSocketId of watchers) {
          this.server.to(adminSocketId).emit('stream-ended', { submissionId });
        }
        this.adminWatchers.delete(submissionId);
      }

      this.logger.log(`🛑 Streaming ended: ${submissionId}`);
    }
  }

  /**
   * Get all active streaming sessions (for listing)
   */
  getActiveStreams(organizationId: string): StreamingSession[] {
    return Array.from(this.sessions.values()).filter(
      (session) => session.organizationId === organizationId,
    );
  }
}
