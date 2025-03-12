"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
}

interface FormData {
  text: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend }) => {
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    reset();
    await onSend(data.text);
  };

  return (
    <div className="sticky bottom-0 p-4 border-t bg-white">
      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
          <Input
            {...register("text", { required: true })}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
            placeholder="Escreva aqui..."
            autoComplete="off"
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-black hover:bg-black/80">
            <Send className="h-5 w-5 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;
