"use client";

import React, { useState, useEffect } from "react";
import ChatBody from "./chat-components/chat-body";
import ChatInput from "./chat-components/chat-input";
import ChatHeader from "./chat-components/chat-header";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

const ChatMain: React.FC = () => {
  const { selectedChat } = useChatStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuthStore();

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
          {user?.userRole !== "ADVISOR" && <ChatInput />}
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

export default ChatMain;