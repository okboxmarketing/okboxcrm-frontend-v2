"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Plus, MessageSquare, Image, Video, Music, FileText } from "lucide-react";
import { getFastMessages, createFastMessage, updateFastMessage, deleteFastMessage, FastMessage, CreateFastMessageData, UpdateFastMessageData } from "@/service/fastMessageService";
import useAuthStore from "@/store/authStore";

interface FastMessageFormData {
    title: string;
    content: string;
}

const FastMessagesPage: React.FC = () => {
    const [fastMessages, setFastMessages] = useState<FastMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [formData, setFormData] = useState<FastMessageFormData>({
        title: "",
        content: "",
    });
    const [selectedMessage, setSelectedMessage] = useState<FastMessage | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();
    const { user } = useAuthStore();

    const fetchFastMessages = async () => {
        setLoading(true);
        try {
            const data = await getFastMessages();
            if (data) setFastMessages(data);
        } catch (error) {
            console.error("Erro ao carregar mensagens rápidas:", error);
            toast({
                description: "Erro ao carregar mensagens rápidas",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFastMessages();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
        });
        setSelectedMessage(null);
        setIsCreating(false);
    };

    const handleOpenCreateDialog = () => {
        setIsCreating(true);
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (message: FastMessage) => {
        setSelectedMessage(message);
        setFormData({
            title: message.title,
            content: message.content || "",
        });
        setIsCreating(false);
        setOpenDialog(true);
    };

    const handleOpenDeleteDialog = (message: FastMessage) => {
        setSelectedMessage(message);
        setConfirmDeleteDialog(true);
    };

    const handleCreateFastMessage = async () => {
        try {
            const data: CreateFastMessageData = {
                title: formData.title,
                content: formData.content || undefined,
            };

            await createFastMessage(data);
            toast({
                description: "Mensagem rápida criada com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            fetchFastMessages();
        } catch (error) {
            console.error("Erro ao criar mensagem rápida:", error);
            toast({
                description: "Erro ao criar mensagem rápida",
                variant: "destructive",
            });
        }
    };

    const handleUpdateFastMessage = async () => {
        if (!selectedMessage) return;

        try {
            const data: UpdateFastMessageData = {
                title: formData.title,
                content: formData.content || undefined,
            };

            await updateFastMessage(selectedMessage.id, data);
            toast({
                description: "Mensagem rápida atualizada com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            fetchFastMessages();
        } catch (error) {
            console.error("Erro ao atualizar mensagem rápida:", error);
            toast({
                description: "Erro ao atualizar mensagem rápida",
                variant: "destructive",
            });
        }
    };

    const handleDeleteFastMessage = async () => {
        if (!selectedMessage) return;

        try {
            await deleteFastMessage(selectedMessage.id);
            toast({
                description: "Mensagem rápida removida com sucesso!",
            });
            setConfirmDeleteDialog(false);
            setSelectedMessage(null);
            fetchFastMessages();
        } catch (error) {
            console.error("Erro ao remover mensagem rápida:", error);
            toast({
                description: "Erro ao remover mensagem rápida",
                variant: "destructive",
            });
        }
    };

    const getMediaTypeIcon = (mediaType: string) => {
        switch (mediaType) {
            case "TEXT":
                return <MessageSquare className="h-4 w-4" />;
            case "IMAGE":
                return <Image className="h-4 w-4" />;
            case "VIDEO":
                return <Video className="h-4 w-4" />;
            case "AUDIO":
                return <Music className="h-4 w-4" />;
            case "DOCUMENT":
                return <FileText className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4" />;
        }
    };

    const getMediaTypeLabel = (mediaType: string) => {
        switch (mediaType) {
            case "TEXT":
                return "Texto";
            case "IMAGE":
                return "Imagem";
            case "VIDEO":
                return "Vídeo";
            case "AUDIO":
                return "Áudio";
            case "DOCUMENT":
                return "Documento";
            default:
                return mediaType;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    };

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Mensagens Rápidas</h1>
                    <p className="text-black/40">Gerencie as mensagens rápidas para envio no chat</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className="bg-black text-white px-3 py-1 text-sm">
                        {fastMessages?.length || 0}
                    </Badge>
                    {user?.userRole === "ADMIN" && (
                        <Button onClick={handleOpenCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" /> Nova Mensagem
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="border rounded-md p-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            ) : fastMessages?.length > 0 ? (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Conteúdo</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                {user?.userRole === "ADMIN" && (
                                    <TableHead>Ações</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fastMessages?.map((message) => (
                                <TableRow key={message.id} className="hover:bg-gray-100">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getMediaTypeIcon(message.mediaType)}
                                            <span className="font-medium">{getMediaTypeLabel(message.mediaType)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {message.title}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {message.content || "-"}
                                    </TableCell>

                                    <TableCell>{formatDate(message.createdAt)}</TableCell>
                                    {user?.userRole === "ADMIN" && (
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleOpenEditDialog(message)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleOpenDeleteDialog(message)}
                                                >
                                                    <Trash className="h-4 w-4 mr-1" /> Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Conteúdo</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhuma mensagem rápida cadastrada
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isCreating ? "Nova Mensagem Rápida" : "Editar Mensagem Rápida"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Digite o título da mensagem..."
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Conteúdo
                            </Label>
                            <Input
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                className="col-span-3"
                                placeholder="Digite o conteúdo da mensagem..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={isCreating ? handleCreateFastMessage : handleUpdateFastMessage}>
                            {isCreating ? "Criar" : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={confirmDeleteDialog} onOpenChange={setConfirmDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Tem certeza que deseja excluir esta mensagem rápida?
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Esta ação não pode ser desfeita.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteDialog(false)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteFastMessage}>
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FastMessagesPage;