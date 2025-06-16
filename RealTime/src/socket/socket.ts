import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';
import { authMiddleware } from './middleware';
import { setupSocketHandlers } from './handlers';

export const initializeSocket = (server: HTTPServer) => {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, SocketData>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.use(authMiddleware);

  io.on('connection', (socket) => {
    setupSocketHandlers(io, socket);
  });

  return io;
}; 