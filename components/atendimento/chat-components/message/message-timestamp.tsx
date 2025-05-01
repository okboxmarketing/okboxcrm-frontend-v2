import React from "react";

export interface MessageTimestampProps {
    timestamp: number;
    fromMe: boolean;
}

const MessageTimestamp: React.FC<MessageTimestampProps> = ({
    timestamp,
    fromMe,
}) => {
    const d = new Date(timestamp);
    const date = d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
    });
    const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={`mt-1 flex items-center justify-end text-[10px] ${fromMe ? "text-gray-200" : "text-gray-500"
                }`}
        >
            <span className="mr-1">{date}</span>
            <span className="mx-1">·</span>
            <span>{time}</span>
        </div>
    );
};

export default MessageTimestamp;
