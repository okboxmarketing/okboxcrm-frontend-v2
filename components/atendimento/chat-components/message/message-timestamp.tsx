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
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

    let dateText: string;

    if (messageDate.getTime() === today.getTime()) {
        dateText = "Hoje";
    } else if (messageDate.getTime() === yesterday.getTime()) {
        dateText = "Ontem";
    } else {
        dateText = d.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
        });
    }

    const time = d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div
            className={`mt-1 flex items-center justify-end text-[10px] ${fromMe ? "text-gray-500" : "text-gray-500"
                }`}
        >
            <span className="mr-1">{dateText}</span>
            <span className="mx-1">·</span>
            <span>{time}</span>
        </div>
    );
};

export default MessageTimestamp;
