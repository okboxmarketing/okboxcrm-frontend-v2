"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Play, Calendar, Clock, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import useAuthStore from "@/store/authStore"
import useSWR from "swr"
import { getHelps, createHelp, CreateHelpDto } from "@/service/helpService"
import { HELP_CATEGORIES } from "@/lib/constants"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function getYoutubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : "";
}

function getYoutubeEmbedUrl(url: string) {
    const id = getYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
}

const AjudaPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("Todos")
    const [playingVideo, setPlayingVideo] = useState<number | null>(null)
    const [openDialog, setOpenDialog] = useState(false)
    const [form, setForm] = useState({ title: "", description: "", videoUrl: "", category: "" })
    const [creating, setCreating] = useState(false)
    const { toast } = useToast()
    const { user } = useAuthStore()
    const { data: videosHelpData = [], isLoading: loadingData, mutate } = useSWR("ajudas", getHelps)

    const categories = ["Todos", ...HELP_CATEGORIES.map(c => c.label)];

    const filteredVideos = videosHelpData.filter((video) => {
        const matchesSearch =
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description.toLowerCase().includes(searchTerm.toLowerCase());
        const catLabel = HELP_CATEGORIES.find(c => c.value === video.category)?.label;
        const matchesCategory = selectedCategory === "Todos" || catLabel === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handlePlayVideo = (videoId: number) => {
        setPlayingVideo(playingVideo === videoId ? null : videoId)
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Básico: "bg-green-100 text-green-800",
            Intermediário: "bg-blue-100 text-blue-800",
            Avançado: "bg-red-100 text-red-800",
            Suporte: "bg-yellow-100 text-yellow-800",
            Integração: "bg-purple-100 text-purple-800",
        }
        return colors[category] || "bg-gray-100 text-gray-800"
    }

    const handleCreateHelp = async () => {
        setCreating(true)
        try {
            const embedUrl = getYoutubeEmbedUrl(form.videoUrl);
            await createHelp({ ...form, videoUrl: embedUrl } as CreateHelpDto)
            mutate()
            setOpenDialog(false)
            setForm({ title: "", description: "", videoUrl: "", category: "" })
            toast({ title: "Ajuda criada com sucesso!" })
        } catch {
            toast({ title: "Erro ao criar ajuda", variant: "destructive" })
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold">Central de Ajuda</h1>
                    <Badge className="bg-black text-white px-3 py-1 text-sm">{filteredVideos.length} vídeos</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Pesquisar vídeos de ajuda"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-r-none w-80"
                    />
                    <Button className="rounded-l-none">
                        <Search />
                    </Button>
                    {user?.userRole === "MASTER" && (
                        <Button
                            className="ml-4"
                            onClick={() => setOpenDialog(true)}
                            variant="default"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Ajuda
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Filtrar por categoria:</span>
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                    >
                        {category}
                    </Button>
                ))}
            </div>

            {loadingData ? (
                <div className="flex items-center justify-center py-12">Carregando...</div>
            ) : filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <Card key={video.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                                    <Badge className={getCategoryColor(video.category)}>
                                        {HELP_CATEGORIES.find(c => c.value === video.category)?.label || video.category}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-3">{video.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    {playingVideo === video.id ? (
                                        <iframe
                                            src={getYoutubeEmbedUrl(video.videoUrl)}
                                            title={video.title}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="relative w-full h-full">
                                            <img
                                                src={
                                                    getYoutubeId(video.videoUrl)
                                                        ? `https://img.youtube.com/vi/${getYoutubeId(video.videoUrl)}/maxresdefault.jpg`
                                                        : "/default-thumb.jpg"
                                                }
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                                <Button
                                                    size="lg"
                                                    onClick={() => handlePlayVideo(video.id)}
                                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16"
                                                >
                                                    <Play className="w-6 h-6 fill-white ml-1" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Publicado: {format(new Date(video.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                                    </div>
                                    {video.updatedAt && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>Atualizado: {format(new Date(video.updatedAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center flex-col gap-4 py-12">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum vídeo encontrado</h3>
                        <p className="text-gray-500">
                            Tente ajustar os filtros ou termo de busca para encontrar o conteúdo desejado.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm("")
                            setSelectedCategory("Todos")
                        }}
                    >
                        Limpar filtros
                    </Button>
                </div>
            )}

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Ajuda</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Título"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                        <Textarea
                            placeholder="Descrição"
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                        <Input
                            placeholder="URL do vídeo (iframe embed do YouTube)"
                            value={form.videoUrl}
                            onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                        />
                        <Select
                            value={form.category}
                            onValueChange={value => setForm(f => ({ ...f, category: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {HELP_CATEGORIES.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateHelp} isLoading={creating} disabled={creating}>
                            Salvar
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AjudaPage
