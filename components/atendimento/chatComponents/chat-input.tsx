"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X, Image, FileText, Video } from "lucide-react";
import { useChatContext } from "@/contexts/ChatContext";
import { sendMediaMessage, SendMediaParams } from "@/service/messageService";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  text: string;
}

const ChatInputWithContext: React.FC = () => {
  const { sendMessage, selectedChat } = useChatContext();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const onSubmit = async (data: FormData) => {
    if (selectedFile) {
      await handleSendMedia(data.text);
    } else if (data.text.trim()) {
      reset();
      await sendMessage(data.text);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        description: "Arquivo muito grande. O tamanho máximo é 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMedia = async (caption: string = "") => {
    if (!selectedFile || !selectedChat) return;
    setIsUploading(true);
    try {
      const base64 = await fileToBase64(selectedFile);

      let mediaType: "image" | "video" | "document" = "document";
      if (selectedFile.type.startsWith('image/')) {
        mediaType = "image";
      } else if (selectedFile.type.startsWith('video/')) {
        mediaType = "video";
      }

      const params: SendMediaParams = {
        remoteJId: selectedChat.Contact.remoteJid,
        mediaType,
        mimeType: selectedFile.type,
        caption: caption,
        media: base64,
        fileName: selectedFile.name
      };

      await sendMediaMessage(params);

      reset();
      clearSelectedFile();

    } catch (error) {
      console.error("Erro ao enviar mídia:", error);
      toast({
        description: "Erro ao enviar mídia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="sticky bottom-0 p-4 border-t bg-white">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
          </div>
          {previewUrl && (
            <div className="h-10 w-10 mr-2">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={clearSelectedFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
          <Input
            {...register("text", { required: !selectedFile })}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
            placeholder={selectedFile ? "Adicionar legenda (opcional)..." : "Escreva aqui..."}
            autoComplete="off"
            disabled={isUploading}
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full bg-black hover:bg-black/80"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-5 w-5 text-white" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInputWithContext;