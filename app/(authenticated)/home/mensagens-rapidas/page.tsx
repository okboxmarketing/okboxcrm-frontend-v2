"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash, Plus, MessageSquare, Image, Video, Music, FileText, Hash } from "lucide-react";
import { getFastMessages, createFastMessage, updateFastMessage, deleteFastMessage, FastMessage, CreateFastMessageData, UpdateFastMessageData } from "@/service/fastMessageService";
import useAuthStore from "@/store/authStore";
import useSWR from "swr";

interface FastMessageFormData {
    title: string;
    content: string;
    shortCode: string;
}

interface FormErrors {
    title?: string;
    content?: string;
    shortCode?: string;
}

const FastMessagesPage: React.FC = () => {
    const [openDialog, setOpenDialog] = useState(false);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [formData, setFormData] = useState<FastMessageFormData>({
        title: "",
        content: "",
        shortCode: "",
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [selectedMessage, setSelectedMessage] = useState<FastMessage | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();
    const { user } = useAuthStore();
    const { data: fastMessages = [], isLoading: loadingData, mutate } = useSWR("fastMessages", getFastMessages);

    const validateShortCode = (shortCode: string): string | undefined => {
        if (!shortCode) return undefined; // Campo é opcional

        // Remove espaços extras e converte para minúsculo
        const cleanShortCode = shortCode.trim().toLowerCase();

        // Verifica se contém espaços
        if (cleanShortCode.includes(' ')) {
            return "A palavra-chave deve ser uma única palavra sem espaços";
        }

        // Verifica se contém caracteres especiais (exceto hífen e underscore)
        if (!/^[a-z0-9_-]+$/.test(cleanShortCode)) {
            return "A palavra-chave deve conter apenas letras, números, hífen (-) e underscore (_)";
        }

        // Verifica se tem pelo menos 2 caracteres
        if (cleanShortCode.length < 2) {
            return "A palavra-chave deve ter pelo menos 2 caracteres";
        }

        // Verifica se não é muito longa
        if (cleanShortCode.length > 20) {
            return "A palavra-chave deve ter no máximo 20 caracteres";
        }

        return undefined;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Limpa erro do campo quando o usuário digita
        if (formErrors[name as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }

        // Validação específica para shortCode
        if (name === 'shortCode') {
            const error = validateShortCode(value);
            setFormErrors(prev => ({ ...prev, shortCode: error }));
        }
    };

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.title.trim()) {
            errors.title = "O título é obrigatório";
        }

        if (!formData.content.trim()) {
            errors.content = "O conteúdo é obrigatório";
        }

        const shortCodeError = validateShortCode(formData.shortCode);
        if (shortCodeError) {
            errors.shortCode = shortCodeError;
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const resetForm = () => {
        setFormData({
            title: "",
            content: "",
            shortCode: "",
        });
        setFormErrors({});
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
            shortCode: message.shortCode || "",
        });
        setFormErrors({});
        setIsCreating(false);
        setOpenDialog(true);
    };

    const handleOpenDeleteDialog = (message: FastMessage) => {
        setSelectedMessage(message);
        setConfirmDeleteDialog(true);
    };

    const handleCreateFastMessage = async () => {
        if (!validateForm()) return;

        try {
            const data: CreateFastMessageData = {
                title: formData.title.trim(),
                content: formData.content.trim() || undefined,
                shortCode: formData.shortCode.trim() || undefined,
            };

            await createFastMessage(data);
            toast({
                description: "Mensagem rápida criada com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            mutate();
        } catch (error) {
            console.error("Erro ao criar mensagem rápida:", error);
            toast({
                description: "Erro ao criar mensagem rápida",
                variant: "destructive",
            });
        }
    };

    const handleUpdateFastMessage = async () => {
        if (!selectedMessage || !validateForm()) return;

        try {
            const data: UpdateFastMessageData = {
                title: formData.title.trim(),
                content: formData.content.trim() || undefined,
                shortCode: formData.shortCode.trim() || undefined,
            };

            await updateFastMessage(selectedMessage.id, data);
            toast({
                description: "Mensagem rápida atualizada com sucesso!",
            });
            setOpenDialog(false);
            resetForm();
            mutate();
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
            mutate();
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

    if (loadingData) return <div className="flex-1 p-6">Carregando...</div>;

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
                    {user?.userRole !== "USER" && (
                        <Button onClick={handleOpenCreateDialog}>
                            <Plus className="h-4 w-4 mr-2" /> Nova Mensagem
                        </Button>
                    )}
                </div>
            </div>

            {fastMessages?.length > 0 ? (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Palavra-chave</TableHead>
                                <TableHead>Conteúdo</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                {user?.userRole !== "USER" && (
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
                                    <TableCell>
                                        {message.shortCode ? (
                                            <div className="flex items-center gap-1">
                                                <Hash className="h-3 w-3 text-gray-500" />
                                                <Badge variant="outline" className="text-xs">
                                                    {message.shortCode}
                                                </Badge>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {message.content || "-"}
                                    </TableCell>
                                    <TableCell>{formatDate(message.createdAt)}</TableCell>
                                    {user?.userRole !== "USER" && (
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
                                <TableHead>Palavra-chave</TableHead>
                                <TableHead>Conteúdo</TableHead>
                                <TableHead>Data de Criação</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
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
                            <div className="col-span-3">
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Digite o título da mensagem..."
                                    className={formErrors.title ? "border-red-500" : ""}
                                />
                                {formErrors.title && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="shortCode" className="text-right">
                                Palavra-chave
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="shortCode"
                                    name="shortCode"
                                    value={formData.shortCode}
                                    onChange={handleInputChange}
                                    placeholder="Ex: oi, ajuda, preco..."
                                    className={formErrors.shortCode ? "border-red-500" : ""}
                                />
                                {formErrors.shortCode && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.shortCode}</p>
                                )}
                                <p className="text-gray-500 text-xs mt-1">
                                    Apenas uma palavra, sem espaços. Ex: oi, ajuda, preco
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="content" className="text-right">
                                Conteúdo
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    placeholder="Digite o conteúdo da mensagem..."
                                    className={formErrors.content ? "border-red-500" : ""}
                                />
                                {formErrors.content && (
                                    <p className="text-red-500 text-sm mt-1">{formErrors.content}</p>
                                )}
                            </div>
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