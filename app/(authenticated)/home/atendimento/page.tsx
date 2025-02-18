"use client"
import { useEffect, useState } from "react";
import io from "socket.io-client";

interface NewMessagePayload {
  contactId: string;
  data: {
    message: {
      conversation: string;
    };
  };
}

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
});

export default function Chat() {
  const [messages, setMessages] = useState<NewMessagePayload[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("Conectado ao WebSocket com ID:", newSocket.id);
      const companyId = localStorage.getItem("companyId");
      if (companyId) {
        console.log("Entrando na sala:", companyId);
        newSocket.emit("join", companyId);
      } else {
        console.warn("companyId não encontrado no localStorage");
      }
    });

    newSocket.onAny((event, ...args) => {
      console.log("Evento recebido:", event, args);
    });

    newSocket.on("newMessage", (payload: NewMessagePayload) => {
      console.log("Nova mensagem recebida:", payload);
      setMessages((prev) => [...prev, payload]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);


  return (
    <div>
      <h1>Mensagens do Chat</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index} className="text-black">
            <strong>{msg.contactId}:</strong> {msg.data.message.conversation}
          </li>
        ))}
      </ul>
    </div>
  );
}
