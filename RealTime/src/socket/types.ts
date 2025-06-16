export interface ServerToClientEvents {
  welcome: (message: string) => void;
  message: (data: any) => void;
  chat: (data: any) => void;
  private_message: (data: { from: string; message: string }) => void;
  user_joined: (message: string) => void;
  user_left: (message: string) => void;
  room_message: (data: { from: string; message: string; room: string }) => void;
  typing_start: (data: { status: string, roomId: string }) => void;
  typing_stop: (data: { status: string, roomId: string }) => void;
  message_status: (data: { messageId: string; status: 'sent' | 'delivered' | 'read' }) => void;
  typing_user: (data: { status: string, roomId: string }) => void;
}

export interface ClientToServerEvents {
  message: (data: any) => void;
  chat: (data: any) => void;
  private_message: (data: { to: string; message: string }) => void;
  join_room: (room: string) => void;
  leave_room: (room: string) => void;
  room_message: (data: { room: string; message: string }) => void;
  typing_start: (data: { roomId: string, status?: string }) => void;
  typing_stop: (data: { roomId: string, status?: string }) => void;
  message_received: (data: { messageId: string }) => void;
  message_read: (data: { messageId: string }) => void;
  typing_user: (data: { status: string, roomId: string }) => void;
}

export interface SocketData {
  token?: string;
  userId?: string;
  username?: string;
  status?: string;

} 