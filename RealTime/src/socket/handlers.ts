import { Socket, Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';
import { verifyToken } from './middleware';

// Store typing users for each room
const typingUsers = new Map<string, Set<string>>();

export const setupSocketHandlers = (
  io: Server<ClientToServerEvents, ServerToClientEvents, SocketData>,
  socket: Socket<ClientToServerEvents, ServerToClientEvents, SocketData>
) => {

  const token = socket.handshake.auth?.token;
  const req_ip = socket.handshake.address || '';
  const au = socket.handshake.headers['user-agent']?.split(/\s+/).join('') || '';

  if (!token) {
    socket.disconnect(true);
    return;
  }

  const verification = verifyToken(token, req_ip, au);
  
  if (!verification.isValid) {
    socket.disconnect(true);
    return;
  }

  // Handle messages
  socket.on('message', (data) => {
    socket.to(data.roomId).emit('message', data);
  });

  // Handle typing start
  socket.on('typing_start', ({ roomId, status = 'typing' }) => {
    socket.to(roomId).emit('typing_user', { status, roomId });
  });

  // Handle typing stop
  socket.on('typing_stop', ({ roomId, status = 'stopped' }) => {
    socket.to(roomId).emit('typing_user', { status, roomId });
  });

  // Handle message received status
  socket.on('message_received', ({ messageId }) => {
    io.emit('message_status', { messageId, status: 'delivered' });
  });

  // Handle message read status
  socket.on('message_read', ({ messageId }) => {
    io.emit('message_status', { messageId, status: 'read' });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Clean up typing status for all rooms
    typingUsers.forEach((users, roomId) => {
      if (users.has(socket.data.userId)) {
        users.delete(socket.data.userId);
        if (users.size === 0) {
          typingUsers.delete(roomId);
        }
        io.to(roomId).emit('typing_stop', { status: 'stopped', roomId });
      }
    });
  });

  socket.on('error', (error) => {
    socket.disconnect(true);
    console.error('Socket error:', error);
  });
}; 