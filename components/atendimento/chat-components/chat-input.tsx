"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, X, Image, FileText, Video, Mic, StopCircle, Music, Smile } from "lucide-react";
import { sendAudioMessage, sendMediaMessage, SendMediaParams } from "@/service/messageService";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chatStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EMOJI_CATEGORIES } from "@/lib/constants";

interface FormData {
  text: string;
}

const ChatInput: React.FC = () => {
  const { sendMessage, selectedChat } = useChatStore();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('faces');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [selectedChat]);

  const { toast } = useToast();

  const insertEmoji = (emoji: string) => {
    if (textInputRef.current) {
      const currentValue = textInputRef.current.value;
      const cursorPosition = textInputRef.current.selectionStart || 0;
      const newValue = currentValue.slice(0, cursorPosition) + emoji + currentValue.slice(cursorPosition);
      textInputRef.current.value = newValue;

      // Atualizar o valor no formulário
      const event = new Event('input', { bubbles: true });
      textInputRef.current.dispatchEvent(event);

      // Posicionar o cursor após o emoji inserido
      const newCursorPosition = cursorPosition + emoji.length;
      textInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      textInputRef.current.focus();
    }
    setEmojiPickerOpen(false);
  };

  const onSubmit = async (data: FormData) => {
    if (audioBlob && selectedChat) {
      await handleSendAudio();
    } else if (selectedFile) {
      await handleSendMedia(data.text);
    } else if (data.text && data.text.trim()) {
      reset();
      await sendMessage(data.text);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        description: "Arquivo muito grande. O tamanho máximo é 10MB.",
        variant: "destructive",
      });
      return;
    }

    // Se for um arquivo de áudio, não permitir seleção
    if (file.type.startsWith('audio/')) {
      toast({
        description: "Use o botão de gravação para enviar áudio.",
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setAudioBlob(null);

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
    setAudioBlob(null);
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

  const handleSendAudio = async () => {
    if (!audioBlob || !selectedChat) return;
    setIsUploading(true);

    try {
      const base64 = await blobToBase64(audioBlob);

      console.log("audio base64: ", base64)
      await sendAudioMessage(selectedChat.Contact.remoteJid, base64);

      reset();
      clearSelectedFile();

    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      toast({
        description: "Erro ao enviar áudio. Tente novamente.",
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

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const getFileIcon = () => {
    if (audioBlob) {
      return <Music className="h-5 w-5 text-blue-500" />;
    }

    if (!selectedFile) return null;

    if (selectedFile.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (selectedFile.type.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    } else {
      return <FileText className="h-5 w-5" />;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setAudioRecorder(recorder);

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Criar um blob de áudio no formato webm (será convertido para MP3 no envio)
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);

        // Limpar qualquer arquivo selecionado previamente
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Criar uma URL para o áudio para ouvir (opcional)
        const audioUrl = URL.createObjectURL(blob);
        setPreviewUrl(audioUrl);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast({
        description: "Erro ao acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (audioRecorder) {
      audioRecorder.stop();
      // Parar todos os tracks do MediaStream
      audioRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="sticky bottom-0 p-4 border-t bg-white">
      {(selectedFile || audioBlob) && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFileIcon()}
            <span className="text-sm truncate max-w-[200px]">
              {audioBlob ? "Mensagem de áudio" : selectedFile?.name}
            </span>
          </div>
          {previewUrl && selectedFile?.type.startsWith('image/') && (
            <div className="h-10 w-10 mr-2">
              <img src={previewUrl} alt="Preview" className="h-full w-full object-cover rounded" />
            </div>
          )}
          {previewUrl && audioBlob && (
            <div className="mr-2">
              <audio controls src={previewUrl} className="h-8 w-40" />
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
          disabled={isUploading || isRecording}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 ${isRecording ? 'bg-red-100' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isUploading}
        >
          {isRecording ? (
            <StopCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Mic className="h-5 w-5 text-gray-500" />
          )}
        </Button>
        <Popover open={emojiPickerOpen} onOpenChange={setEmojiPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={isUploading || isRecording}
            >
              <Smile className="h-5 w-5 text-gray-500" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <div className="p-3 border-b">
              <h3 className="text-sm font-medium mb-2">Emojis</h3>
              <div className="flex gap-1 overflow-x-auto">
                {Object.keys(EMOJI_CATEGORIES).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedEmojiCategory(category as keyof typeof EMOJI_CATEGORIES)}
                    className={`px-2 py-1 text-xs rounded transition-colors whitespace-nowrap ${selectedEmojiCategory === category
                      ? 'bg-gray-200 text-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    type="button"
                  >
                    {category === 'faces' && '😀'}
                    {category === 'gestures' && '👋'}
                    {category === 'people' && '👶'}
                    {category === 'nature' && '🌸'}
                    {category === 'food' && '🍎'}
                    {category === 'activities' && '⚽'}
                    {category === 'objects' && '⌚'}
                    {category === 'symbols' && '❤️'}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-10 gap-1">
                {EMOJI_CATEGORIES[selectedEmojiCategory].map((emoji: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                    type="button"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
          <Input
            {...register("text")}
            ref={(e) => {
              register("text").ref(e);
              textInputRef.current = e;
            }}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0"
            placeholder={selectedFile || audioBlob ? "Adicionar legenda (opcional)..." : "Escreva aqui..."}
            autoComplete="off"
            disabled={isUploading || isRecording}

          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 rounded-full bg-black hover:bg-black/80"
            disabled={isUploading || isRecording}
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

export default ChatInput;