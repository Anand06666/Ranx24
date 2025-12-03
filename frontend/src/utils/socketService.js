import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
    }

    connect(token) {
        if (this.socket) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Socket connected:', this.socket.id);
            this.connected = true;
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            this.connected = false;
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('join_chat', chatId);
            console.log('Joined chat:', chatId);
        }
    }

    leaveChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('leave_chat', chatId);
        }
    }

    sendMessage(chatId, message) {
        if (this.socket && this.connected) {
            this.socket.emit('send_message', { chatId, message });
        }
    }

    onNewMessage(callback) {
        if (this.socket) {
            this.socket.on('new_message', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    sendTyping(chatId, isTyping) {
        if (this.socket && this.connected) {
            this.socket.emit('typing', { chatId, isTyping });
        }
    }

    removeListener(event) {
        if (this.socket) {
            this.socket.off(event);
        }
    }

    removeAllListeners() {
        if (this.socket) {
            this.socket.removeAllListeners();
        }
    }
}

export default new SocketService();
