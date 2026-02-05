import { io, Socket } from "socket.io-client";
import { API_CONFIG } from "@/lib/endpoints";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return this.socket;

    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (!token) return null;

    this.socket = io(API_CONFIG.BASE_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return !!this.socket?.connected;
  }

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.socket) return () => {};
    this.socket.on(eventName, callback);
    return () => this.socket?.off(eventName, callback);
  }
}

const socketService = new SocketService();
export default socketService;
