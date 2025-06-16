import { Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents, SocketData } from './types';
import { decrypt } from '../Lock/Enc.js';
import { getClientIP } from '../Lock/GetIp.js';

interface VerifiedUser {
  userId: string;
  username: string;
  isValid: boolean;
  error?: string;
}

export const verifyToken = (token: string, req_ip: string, userAgent: string): VerifiedUser => {
  if (!token) {
    return { userId: '', username: '', isValid: false, error: 'Something went wrong. Please try again later.' };
  }
  
  const check = decrypt(token, `${process.env.SOCKET_ID_2}`);

  if (!check) {
    return { userId: '', username: '', isValid: false, error: 'We couldn\'t verify you there. Please try again later.' };
  }

  const { ip, user_agent, expires_at, userId, username } = JSON.parse(check);
  
  if (ip !== req_ip || userAgent !== user_agent || new Date(expires_at) < new Date()) {
    return { userId: '', username: '', isValid: false, error: 'Are you sure, you\'re making these requests?' };
  }

  return { userId, username, isValid: true };
};

export const authMiddleware = async (socket: Socket<ClientToServerEvents, ServerToClientEvents, SocketData>, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token;
  const req_ip = socket.handshake.address || '';
  const au = socket.handshake.headers['user-agent']?.split(/\s+/).join('') || '';

  if (!token) {
    socket.disconnect(true);
    return next(new Error('Something went wrong. Please try again later.'));
  }

  const verification = verifyToken(token, req_ip, au);
  
  if (!verification.isValid) {
    socket.disconnect(true);
    return next(new Error(verification.error));
  }

  // Add user information to socket datas
  socket.data.userId = verification.userId;
  socket.data.username = verification.username;

  let id = socket.handshake.query?.id;
  let know_who = socket.handshake.auth?.know_who

  socket.join(`${know_who}`)
  if(id === know_who){
    socket.join(`${id}`)
  }
  
  next();
}; 