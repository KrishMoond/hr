import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket) return;

    this.socket = io('http://localhost:5000', {
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat methods
  joinChat(chatId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  sendMessage(data: any) {
    if (this.socket) {
      this.socket.emit('send-message', data);
    }
  }

  onNewMessage(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  // User status methods
  updateUserStatus(status: 'online' | 'offline' | 'away') {
    if (this.socket) {
      this.socket.emit('user-status', status);
    }
  }

  onUserStatusChange(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('user-status-change', callback);
    }
  }

  // Notification methods
  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Generic event listeners
  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event: string, data: any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  get connected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
export default socketService;