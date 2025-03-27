"use client";

import React, { useState, useEffect } from "react";
import { useChatContext } from "@/contexts/ChatContext";
import ChatBody from "./chatComponents/chat-body";
import ChatInputWithContext from "./chatComponents/chat-input";
import ChatHeader from "./chatComponents/chat-header";
import { useAuth } from "@/context/authContext";

const ChatMainWithContext: React.FC = () => {
  const { selectedChat } = useChatContext();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">
      {selectedChat ? (
        <>
          <ChatHeader />
          <ChatBody onSelectImage={(url) => setSelectedImage(url)} />
          {user?.userRole !== "ADVISOR" && <ChatInputWithContext />}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-center text-gray-500">
            Selecione um contato para iniciar o chat
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatMainWithContext;