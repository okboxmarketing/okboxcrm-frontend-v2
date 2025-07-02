import React from "react";
import { MediaEnum, NewMessagePayload } from "@/lib/types";
import { FileText } from "lucide-react";

interface QuotedMessageProps {
    quotedMessage: NewMessagePayload;
    fromMe: boolean;
    onQuoteClick: (messageId: string) => void;
}

const QuotedMessage: React.FC<QuotedMessageProps> = ({ quotedMessage, fromMe, onQuoteClick }) => {
    const renderQuotedContent = () => {
        switch (quotedMessage.mediaType) {
            case MediaEnum.IMAGE:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                            <img
                                src={quotedMessage.contentUrl}
                                alt="Imagem citada"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-xs truncate">Imagem</span>
                    </div>
                );
            case MediaEnum.AUDIO:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs">🎵</span>
                        </div>
                        <span className="text-xs truncate">Áudio</span>
                    </div>
                );
            case MediaEnum.VIDEO:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs">🎥</span>
                        </div>
                        <span className="text-xs truncate">Vídeo</span>
                    </div>
                );
            case MediaEnum.DOCUMENT:
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs truncate">Documento</span>
                    </div>
                );
            default:
                return (
                    <span className="text-xs truncate">
                        {quotedMessage.data.message.conversation || quotedMessage.content}
                    </span>
                );
        }
    };

    return (
        <div
            className={`border-l-4 ${fromMe
                ? "border-white/30 bg-white/10"
                : "border-gray-300 bg-gray-50"
                } p-2 rounded-l-md mb-2 max-w-full cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => onQuoteClick(quotedMessage.data.key.id)}
        >
            <div className="text-xs opacity-70 mb-1">
                {quotedMessage.data.key.fromMe ? "Você" : "Contato"}
            </div>
            <div className="max-w-full overflow-hidden">
                {renderQuotedContent()}
            </div>
        </div>
    );
};

export default QuotedMessage; 