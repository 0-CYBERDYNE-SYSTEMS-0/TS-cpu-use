import { WebSocket } from 'ws';
import { Message, ToolCall } from '../client/src/lib/types';

const clients = new Set<WebSocket>();

export function handleWebSocket(ws: WebSocket) {
  clients.add(ws);

  ws.on('close', () => {
    clients.delete(ws);
  });
}

export function broadcastMessage(message: Message) {
  const data = JSON.stringify({ type: 'message', message });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

export function broadcastToolCall(toolCall: ToolCall) {
  const data = JSON.stringify({ type: 'toolCall', toolCall });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}