"use client";

import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, X, Image, FileText, Video, Mic, StopCircle, Music, Smile, Plus, MessageSquare, Hash } from "lucide-react";
import { sendAudioMessage, sendMediaMessage, SendMediaParams, MediaItem } from "@/service/messageService";
import { useToast } from "@/hooks/use-toast";
import { useChatStore } from "@/store/chatStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EMOJI_CATEGORIES } from "@/lib/constants";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFastMessages, FastMessage } from "@/service/fastMessageService";
import Link from "next/link";
import useSWR from "swr";

interface FormData {
  text: string;
}

interface ChatInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  replyingTo?: any;
  onSendReply?: (text: string) => Promise<void>;
}

const ChatInput: React.FC<ChatInputProps> = ({ replyingTo, onSendReply }) => {
  const { sendMessage, sendMultipleMedia, selectedChat } = useChatStore();
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<keyof typeof EMOJI_CATEGORIES>('faces');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [fastMessageDialogOpen, setFastMessageDialogOpen] = useState(false);
  const [showFastMessageSuggestions, setShowFastMessageSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // SWR para carregar mensagens rápidas
  const { data: fastMessages = [], error: fastMessagesError } = useSWR("fastMessages", getFastMessages);

  const [textValue, setTextValue] = useState("");

  useEffect(() => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [selectedChat]);

  useEffect(() => {
    if (fastMessagesError) {
      console.log("Erro ao carregar fastMessages:", fastMessagesError);
    }
  }, [fastMessages, fastMessagesError]);

  useEffect(() => {
    if (!textValue) {
      setShowFastMessageSuggestions(false);
      setSelectedSuggestionIndex(0);
      return;
    }

    const lines = textValue.split('\n');
    const currentLine = lines[lines.length - 1];

    if (currentLine.startsWith('/')) {
      const searchTerm = currentLine.slice(1).toLowerCase();
      const filteredMessages = fastMessages.filter(message =>
        message.shortCode?.toLowerCase().includes(searchTerm)
      );

      if (filteredMessages.length > 0) {
        setShowFastMessageSuggestions(true);
        setSelectedSuggestionIndex(0);
      } else {
        setShowFastMessageSuggestions(false);
      }
    } else {
      setShowFastMessageSuggestions(false);
      setSelectedSuggestionIndex(0);
    }
  }, [textValue, fastMessages]);

  const { toast } = useToast();

  const insertEmoji = (emoji: string) => {
    if (textInputRef.current) {
      const currentValue = textInputRef.current.value;
      const cursorPosition = textInputRef.current.selectionStart || 0;
      const newValue = currentValue.slice(0, cursorPosition) + emoji + currentValue.slice(cursorPosition);
      textInputRef.current.value = newValue;

      const event = new Event('input', { bubbles: true });
      textInputRef.current.dispatchEvent(event);
      // Posicionar o cursor após o emoji inserido
      const newCursorPosition = cursorPosition + emoji.length;
      textInputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      textInputRef.current.focus();

      // Ajustar altura do textarea
      adjustTextareaHeight();
    }
    setEmojiPickerOpen(false);
  };

  const adjustTextareaHeight = () => {
    if (textInputRef.current) {
      textInputRef.current.style.height = 'auto';
      textInputRef.current.style.height = Math.min(textInputRef.current.scrollHeight, 120) + 'px';
    }
  };

  const onSubmit = async (data: FormData) => {
    if (audioBlob && selectedChat) {
      await handleSendAudio();
    } else if (selectedFiles.length > 0) {
      await handleSendMultipleMedia(data.text);
    } else if (data.text && data.text.trim()) {
      reset();

      if (replyingTo && onSendReply) {
        await onSendReply(data.text);
      } else {
        await sendMessage(data.text);
      }

      if (textInputRef.current) {
        textInputRef.current.style.height = 'auto';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Verificar limite de 10 arquivos
    if (selectedFiles.length + files.length > 10) {
      toast({
        description: "Máximo de 10 arquivos por vez.",
        variant: "destructive",
      });
      return;
    }

    const validFiles: File[] = [];
    const newPreviewUrls: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          description: `Arquivo ${file.name} muito grande. O tamanho máximo é 10MB.`,
          variant: "destructive",
        });
        continue;
      }

      // Se for um arquivo de áudio, não permitir seleção
      if (file.type.startsWith('audio/')) {
        toast({
          description: `Use o botão de gravação para enviar áudio (${file.name}).`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result as string);
          setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setAudioBlob(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAudioBlob(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMultipleMedia = async (caption: string = "") => {
    if (selectedFiles.length === 0 || !selectedChat) return;
    setIsUploading(true);
    
    try {
      const mediaItems: MediaItem[] = [];

      for (const file of selectedFiles) {
        const base64 = await fileToBase64(file);

        let mediaType: "image" | "video" | "document" = "document";
        if (file.type.startsWith('image/')) {
          mediaType = "image";
        } else if (file.type.startsWith('video/')) {
          mediaType = "video";
        }

        mediaItems.push({
          mediaType,
          mimeType: file.type,
          caption: caption,
          media: base64,
          fileName: file.name
        });
      }

      await sendMultipleMedia(mediaItems);

      reset();
      clearSelectedFiles();

    } catch (error) {
      console.error("Erro ao enviar mídias:", error);
      toast({
        description: "Erro ao enviar mídias. Tente novamente.",
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
      await sendAudioMessage(selectedChat.Contact.remoteJid, base64);

      clearSelectedFiles();
      reset();

    } catch (error) {
      console.error("Erro ao enviar áudio:", error);
      toast({
        description: `Erro ao enviar áudio, tente novamente. ${error}`,
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

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-500" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="h-4 w-4 text-blue-500" />;
    } else {
      return <FileText className="h-4 w-4 text-gray-500" />;
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
        setSelectedFiles([]);
        setPreviewUrls([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Criar uma URL para o áudio para ouvir (opcional)
        const audioUrl = URL.createObjectURL(blob);
        setPreviewUrls([audioUrl]);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast({
        description: "Erro ao iniciar gravação de áudio, verifique as permissões do navegador.",
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

  const handleFastMessageSelect = async (fastMessage: FastMessage) => {
    if (!selectedChat) return;
    try {
      await sendMessage(fastMessage.content || fastMessage.title);
      setFastMessageDialogOpen(false);
    } catch (error) {
      console.error("Erro ao enviar mensagem rápida:", error);
      toast({
        description: "Erro ao enviar mensagem rápida",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionSelect = (fastMessage: FastMessage) => {
    if (!textInputRef.current) return;

    const lines = textValue.split('\n');
    const currentLineIndex = lines.length - 1;

    lines[currentLineIndex] = fastMessage.content || fastMessage.title;

    const newValue = lines.join('\n');
    textInputRef.current.value = newValue;

    const event = new Event('input', { bubbles: true });
    textInputRef.current.dispatchEvent(event);

    setShowFastMessageSuggestions(false);
    textInputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      return; // Permitir quebra de linha
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (showFastMessageSuggestions && filteredSuggestions.length > 0) {
        e.preventDefault();
        if (filteredSuggestions[selectedSuggestionIndex]) {
          handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex]);
        }
        return;
      }

      e.preventDefault();
      const formData = { text: textInputRef.current?.value || '' };
      onSubmit(formData);
    } else if (showFastMessageSuggestions) {
      const lines = textValue.split('\n');
      const currentLine = lines[lines.length - 1];
      const searchTerm = currentLine.slice(1).toLowerCase();
      const filteredMessages = fastMessages.filter(message =>
        message.shortCode?.toLowerCase().includes(searchTerm)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < filteredMessages.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev > 0 ? prev - 1 : filteredMessages.length - 1
        );
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (filteredMessages[selectedSuggestionIndex]) {
          handleSuggestionSelect(filteredMessages[selectedSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        setShowFastMessageSuggestions(false);
      }
    }
  };

  // Obter mensagens filtradas para sugestões
  const getFilteredSuggestions = () => {
    if (!textValue) {
      return [];
    }

    const lines = textValue.split('\n');
    const currentLine = lines[lines.length - 1];

    if (!currentLine.startsWith('/')) {
      return [];
    }

    const searchTerm = currentLine.slice(1).toLowerCase();

    const filtered = fastMessages.filter(message =>
      message.shortCode?.toLowerCase().includes(searchTerm)
    );

    return filtered;
  };

  const filteredSuggestions = getFilteredSuggestions();

  return (
    <div className="sticky bottom-0 p-4 border-t bg-white">
      {replyingTo && (
        <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-500 mb-1">Respondendo a</div>
              <div className="text-sm text-gray-900 truncate">
                {replyingTo.mediaType === "TEXT"
                  ? replyingTo.data.message.conversation
                  : replyingTo.caption || `Mensagem de ${replyingTo.mediaType.toLowerCase()}`
                }
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full hover:bg-gray-200"
              onClick={() => {
                if (onSendReply) {
                  onSendReply("");
                }
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {(selectedFiles.length > 0 || audioBlob) && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg">
          {audioBlob && (
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Music className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Mensagem de áudio</span>
              </div>
              <div className="flex items-center gap-2">
                <audio controls src={previewUrls[0] || undefined} className="h-8 w-40" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={clearSelectedFiles}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={clearSelectedFiles}
                >
                  Limpar todos
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file)}
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(1)}MB)
                      </span>
                    </div>
                    {previewUrls[index] && file.type.startsWith('image/') && (
                      <div className="h-8 w-8 mr-2 flex-shrink-0">
                        <img 
                          src={previewUrls[index]} 
                          alt="Preview" 
                          className="h-full w-full object-cover rounded" 
                        />
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full flex-shrink-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showFastMessageSuggestions && filteredSuggestions.length > 0 && (
        <div
          className="mb-2 bg-white border rounded-lg shadow-lg p-2"
        >
          <div className="text-xs text-gray-500 mb-2 px-2">Mensagens rápidas:</div>
          <div className="space-y-1">
            {filteredSuggestions.map((message, index) => (
              <div
                key={message.id}
                className={`px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${index === selectedSuggestionIndex ? 'bg-gray-100' : ''
                  }`}
                onClick={() => handleSuggestionSelect(message)}
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{message.shortCode}</span>
                      <span className="text-xs text-gray-500">-</span>
                      <span className="text-sm text-gray-600">{message.title}</span>
                    </div>
                    {message.content && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              disabled={isUploading || isRecording}
            >
              <Plus className="h-5 w-5 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4 mr-2" />
              Enviar anexo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setFastMessageDialogOpen(true);
            }}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagem rápida
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
        <Dialog open={fastMessageDialogOpen} onOpenChange={setFastMessageDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Mensagens Rápidas</DialogTitle>
            </DialogHeader>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {fastMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma mensagem rápida encontrada
                </p>
              ) : (
                fastMessages.map((message) => (
                  <div
                    key={message.id}
                    className="p-3 border rounded-lg flex items-center justify-between gap-2 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-medium text-sm">{message.title}</h4>
                      {message.content && (
                        <p className="text-sm text-gray-600">{message.content}</p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="ml-2 hover:bg-black hover:text-white rounded-full"
                      onClick={() => handleFastMessageSelect(message)}
                      title="Enviar mensagem rápida"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center">
              <Link href="/home/mensagens-rapidas" className="text-sm text-gray-500 hover:text-gray-700">
                Cadastre uma nova mensagem rápida
              </Link>
            </div>
          </DialogContent>
        </Dialog>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
          <Textarea
            {...register("text")}
            ref={(e) => {
              register("text").ref(e);
              textInputRef.current = e;
            }}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 resize-none min-h-[40px] max-h-[120px]"
            placeholder={selectedFiles.length > 0 || audioBlob ? "Adicionar legenda (opcional)..." : "Escreva aqui... (digite / para mensagens rápidas)"}
            autoComplete="off"
            disabled={isUploading || isRecording}
            rows={1}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setTextValue(e.target.value);
              adjustTextareaHeight();
            }}
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