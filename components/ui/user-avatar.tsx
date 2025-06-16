import { useState, useEffect } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface UserAvatarProps {
    name: string;
    pictureUrl?: string | null;
    className?: string;
    expanded?: boolean;
}

export function UserAvatar({ name, pictureUrl, className, expanded = true }: UserAvatarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isValidImage, setIsValidImage] = useState(false);

    const getInitials = (name: string) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    useEffect(() => {
        if (!pictureUrl) {
            setIsValidImage(false);
            return;
        }

        const img = new Image();
        img.onload = () => {
            setIsValidImage(true);
            setImageError(false);
        };
        img.onerror = () => {
            setIsValidImage(false);
            setImageError(true);
        };
        img.src = pictureUrl;
    }, [pictureUrl]);

    const handleImageError = () => {
        setImageError(true);
        setIsValidImage(false);
    };

    const shouldShowImage = pictureUrl && !imageError && isValidImage;

    return (
        <Dialog open={isOpen} onOpenChange={expanded ? setIsOpen : undefined}>
            {shouldShowImage ? (
                <DialogTrigger asChild className={`${expanded ? "hover:opacity-80 transition-opacity" : ""}`}>
                    <Avatar className={`cursor-pointer ${className}`}>
                        <AvatarImage
                            src={pictureUrl}
                            alt={name}
                            onError={handleImageError}
                        />
                    </Avatar>
                </DialogTrigger>
            ) : (
                <Avatar className={className}>
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(name)}
                    </AvatarFallback>
                </Avatar>
            )}
            <DialogContent className="max-w-md max-h-[80vh] p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Foto de perfil de {name}</DialogTitle>
                    <DialogDescription>
                        Modal contendo a foto de perfil ampliada de {name}
                    </DialogDescription>
                </DialogHeader>
                {shouldShowImage && (
                    <img
                        src={pictureUrl}
                        alt={name}
                        className="w-full h-full object-contain rounded-lg"
                        onError={handleImageError}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
} 