"use client";

import React, { Fragment, useState } from "react";
import ChatBody from "./chat-components/chat-body";
import ChatInput from "./chat-components/chat-input";
import ChatHeader from "./chat-components/chat-header";
import useAuthStore from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";

const ChatMain: React.FC = () => {
  const { selectedChat, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const showChatInput = user?.userRole !== "ADVISOR" && selectedChat?.status !== "PENDING";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [replyingTo, setReplyingTo] = useState<any>(null);

  const handleSendReply = async (text: string) => {
    if (text === "") {
      setReplyingTo(null);
      return;
    }

    if (replyingTo && selectedChat) {
      try {
        await sendMessage(text, replyingTo.data.key.id);
        setReplyingTo(null);
      } catch (error) {
        console.error('Erro ao enviar resposta:', error);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">
      {selectedChat ? (
        <Fragment>
          <ChatHeader />
          <ChatBody replyingTo={replyingTo} setReplyingTo={setReplyingTo} />
          {showChatInput && <ChatInput replyingTo={replyingTo} onSendReply={handleSendReply} />}
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