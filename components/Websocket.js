import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

// Connects to websocket
export const connectWebSocket = (onEventReceived) => {
  const socket = new SockJS("http://localhost:8080/ws"); 
  stompClient = Stomp.over(socket);

  stompClient.connect({}, () => {
    console.log("Connected to WebSocket");
    stompClient.subscribe("/topic/events", (message) => {
      const event = JSON.parse(message.body);
      onEventReceived(event);
    });
  });
};

export const disconnectWebSocket = () => {
  if (stompClient !== null) {
    stompClient.disconnect();
    console.log("Disconnected from WebSocket");
  }
};
