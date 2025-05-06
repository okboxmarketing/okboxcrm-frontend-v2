"use client";

import React, { Fragment } from "react";
import ChatBody from "./chat-components/chat-body";
import ChatInput from "./chat-components/chat-input";
import ChatHeader from "./chat-components/chat-header";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

const ChatMain: React.FC = () => {
  const { selectedChat } = useChatStore();
  const { user } = useAuthStore();
  const showChatInput = user?.userRole !== "ADVISOR" && selectedChat?.status !== "PENDING";

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">
      {selectedChat ? (
        <Fragment>
          <ChatHeader />
          <ChatBody />
          {showChatInput && <ChatInput />}
        </Fragment>
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