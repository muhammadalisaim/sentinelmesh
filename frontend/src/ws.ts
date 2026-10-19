type Listener = (data: any) => void;

class StreamClient {
  private ws: WebSocket | null = null;
  private listeners: Listener[] = [];
  private isConnecting = false;
  private url = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000/ws/stream";

  connect() {
    if (typeof window === "undefined") return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isConnecting = true;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnecting = false;
        console.log("[WS] Connected to SentinelMesh telemetry stream");
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.listeners.forEach((cb) => cb(parsed));
        } catch (e) {
          console.error("[WS] Parse error:", e);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        // Reconnect after 3 seconds
        setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.warn("[WS] Telemetry stream error:", err);
        this.ws?.close();
      };
    } catch (e) {
      this.isConnecting = false;
      setTimeout(() => this.connect(), 3000);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.push(listener);
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.connect();
    }
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const streamClient = new StreamClient();
