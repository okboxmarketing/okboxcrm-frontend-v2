"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, CheckCircle, Circle, AlertCircle, XCircle, CalendarIcon } from "lucide-react";
import { createTask, getTasksByCompany, updateTaskStatus, Task } from "@/service/taskService";
import { searchTicketsByName } from "@/service/ticketsService";
import { User, Ticket } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import useSWR from "swr";
import { format, parseISO, startOfWeek, endOfWeek, addWeeks, subWeeks, startOfDay, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPhone } from "@/lib/utils";
import { useChatStore } from "@/store/chatStore";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const taskTypes = [
    { value: 'LIGAR', label: 'Ligar', icon: '📞' },
    { value: 'EMAIL', label: 'Email', icon: '📧' },
    { value: 'REUNIAO', label: 'Reunião', icon: '🤝' },
    { value: 'TAREFA', label: 'Tarefa', icon: '📋' },
    { value: 'ALMOCO', label: 'Almoço', icon: '🍽️' },
    { value: 'VISITA', label: 'Visita', icon: '🏢' },
    { value: 'WHATSAPP', label: 'WhatsApp', icon: '💬' },
    { value: 'OUTROS', label: 'Outros', icon: '📌' },
] as const;

const taskStatuses = [
    { value: 'SCHEDULED', label: 'Agendada', icon: <Circle className="h-4 w-4" />, color: 'bg-blue-500' },
    { value: 'DELAYED', label: 'Atrasada', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-red-500' },
    { value: 'COMPLETED', label: 'Concluída', icon: <CheckCircle className="h-4 w-4" />, color: 'bg-green-500' },
    { value: 'CANCELED', label: 'Cancelada', icon: <XCircle className="h-4 w-4" />, color: 'bg-gray-500' },
] as const;

type TaskFormData = {
    ticketId?: number;
    title: string;
    description?: string;
    type: 'LIGAR' | 'EMAIL' | 'REUNIAO' | 'TAREFA' | 'ALMOCO' | 'VISITA' | 'WHATSAPP' | 'OUTROS';
    scheduledDate: string;
    scheduledTime: string;
    sendAutomatically?: boolean;
    whatsappMessage?: string;
};

const TarefasPage: React.FC = () => {
    const [loadingCreate, startTransition] = useTransition();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTaskType, setSelectedTaskType] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [searchingTickets, setSearchingTickets] = useState(false);
    const [ticketSearchTerm, setTicketSearchTerm] = useState('');
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const { toast } = useToast();
    const { clearNewTask } = useChatStore();

    const { data: tasks = [], isLoading: loadingTasks, mutate } = useSWR("tasks", getTasksByCompany);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<TaskFormData>();

    const watchedType = watch('type');
    const watchedSendAutomatically = watch('sendAutomatically');

    useEffect(() => {
        clearNewTask();
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const localDate = `${year}-${month}-${day}`;
        setValue("scheduledDate", localDate);
    }, [clearNewTask, setValue]);

    const onSubmit = async (data: TaskFormData) => {
        console.log("Dados do formulário:", data);

        startTransition(async () => {
            try {
                const taskData = {
                    ...data,
                    ticketId: data.ticketId || 0,
                    sendAutomatically: data.sendAutomatically || false,
                };

                console.log("Dados da tarefa a serem enviados:", taskData);

                const result = await createTask(taskData);
                console.log("Resposta da API:", result);

                reset();
                mutate();
                setDialogOpen(false);
                setSelectedTicket(null);
                setTickets([]);
                setTicketSearchTerm('');
                toast({
                    description: 'Tarefa criada com sucesso!',
                });
            } catch (error) {
                console.error("Erro ao criar tarefa:", error);
                toast({
                    description: `Erro ao criar tarefa: ${error}`,
                    variant: 'destructive',
                });
            }
        });
    };

    const handleStatusChange = async (taskId: number, newStatus: string) => {
        try {
            await updateTaskStatus(taskId, newStatus as any);
            mutate();
            toast({
                description: 'Status da tarefa atualizado!',
            });
        } catch (error) {
            toast({
                description: 'Erro ao atualizar status da tarefa',
                variant: 'destructive',
            });
        }
    };

    const filteredTasks = tasks.filter((task: Task) => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.Responsible?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || statusFilter === 'all' || task.status === statusFilter;
        const matchesType = !typeFilter || typeFilter === 'all' || task.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getWeekDays = () => {
        const start = startOfWeek(currentWeek, { weekStartsOn: 0 });
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push(addDays(start, i));
        }
        return days;
    };

    const getTasksForDay = (date: Date) => {
        return filteredTasks.filter((task: Task) => {
            const taskDate = startOfDay(parseISO(task.scheduledDate));
            return taskDate.getTime() === startOfDay(date).getTime();
        });
    };

    const getStatusBadge = (status: string) => {
        const statusInfo = taskStatuses.find(s => s.value === status);
        if (!statusInfo) return null;

        return (
            <Badge variant="outline" className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                {statusInfo.label}
            </Badge>
        );
    };

    const getTypeIcon = (type: string) => {
        const typeInfo = taskTypes.find(t => t.value === type);
        return typeInfo?.icon || '📌';
    };

    const searchTickets = async () => {
        if (ticketSearchTerm.length < 2) {
            toast({
                description: 'Digite pelo menos 2 caracteres para buscar',
                variant: 'destructive',
            });
            return;
        }

        setSearchingTickets(true);
        try {
            const results = await searchTicketsByName(ticketSearchTerm, 10);
            setTickets(results);
        } catch (error) {
            console.error('Erro ao buscar tickets:', error);
            toast({
                description: 'Erro ao buscar tickets',
                variant: 'destructive',
            });
        } finally {
            setSearchingTickets(false);
        }
    };

    if (loadingTasks) return <div className="flex justify-center p-8">Carregando...</div>;

    return (
        <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Tarefas Agendadas</h1>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                        setSelectedTicket(null);
                        setTickets([]);
                        setTicketSearchTerm('');
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Tarefa
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="task-form-description">
                        <DialogHeader>
                            <DialogTitle>Criar Nova Tarefa</DialogTitle>
                        </DialogHeader>
                        <div id="task-form-description" className="sr-only">
                            Formulário para criar uma nova tarefa com título, tipo, descrição, data, horário e configurações opcionais.
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Título *</Label>
                                    <Input id="title" {...register("title")} />
                                    {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="type">Tipo de Tarefa *</Label>
                                    <Select onValueChange={(value) => {
                                        setValue("type", value as any);
                                        setSelectedTaskType(value);
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {taskTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{type.icon}</span>
                                                        {type.label}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Descrição</Label>
                                <Textarea id="description" {...register("description")} rows={3} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="ticketId">Ticket (opcional)</Label>
                                    <Select onValueChange={(value) => {
                                        setValue("ticketId", parseInt(value));
                                        const ticket = tickets.find(t => t.id.toString() === value);
                                        setSelectedTicket(ticket || null);
                                    }} onOpenChange={(open) => {
                                        if (!open) {
                                            setTickets([]);
                                            setTicketSearchTerm('');
                                        }
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione um ticket (opcional)">
                                                {selectedTicket ? selectedTicket.Contact.name : "Selecione um ticket (opcional)"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <div className="p-2">
                                                <div className="flex gap-2 mb-2">
                                                    <Input
                                                        placeholder="Buscar por nome do contato..."
                                                        value={ticketSearchTerm}
                                                        onChange={(e) => setTicketSearchTerm(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        onClick={searchTickets}
                                                        disabled={searchingTickets}
                                                    >
                                                        {searchingTickets ? '...' : 'Buscar'}
                                                    </Button>
                                                </div>
                                                {searchingTickets && (
                                                    <div className="text-center py-2 text-sm text-muted-foreground">
                                                        Buscando...
                                                    </div>
                                                )}
                                                {tickets.map((ticket) => (
                                                    <SelectItem key={ticket.id} value={ticket.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{ticket.Contact.name}</span>
                                                            <span className="text-sm text-muted-foreground">
                                                                {formatPhone(ticket.Contact.phone)}
                                                                <span className="text-muted-foreground border rounded-md px-2  ml-2" style={{ color: ticket.KanbanStep?.color, borderColor: ticket.KanbanStep?.color }}>
                                                                    {ticket.KanbanStep?.name}
                                                                </span>
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                                {tickets.length === 0 && !searchingTickets && (
                                                    <div className="text-center py-2 text-sm text-muted-foreground">
                                                        Digite e clique em buscar para encontrar tickets
                                                    </div>
                                                )}
                                            </div>
                                        </SelectContent>
                                    </Select>
                                    {errors.ticketId && <p className="text-red-500 text-sm">{errors.ticketId.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="scheduledDate">Data *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !watch("scheduledDate") && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {watch("scheduledDate") ? (
                                                    (() => {
                                                        const date = new Date(watch("scheduledDate"));
                                                        return format(date, "PPP", { locale: ptBR });
                                                    })()
                                                ) : (
                                                    <span>Escolha uma data</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={watch("scheduledDate") ? new Date(watch("scheduledDate")) : undefined}
                                                onSelect={(date) => {
                                                    if (date) {
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const localDate = `${year}-${month}-${day}`;
                                                        setValue("scheduledDate", localDate);
                                                    }
                                                }}
                                                disabled={(date) => {
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    return date < today;
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.scheduledDate && (
                                        <p className="text-red-500 text-sm">{errors.scheduledDate.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="scheduledTime">Horário *</Label>
                                    <Input
                                        id="scheduledTime"
                                        type="time"
                                        {...register("scheduledTime")}
                                        className="w-full"
                                    />
                                    {errors.scheduledTime && (
                                        <p className="text-red-500 text-sm">{errors.scheduledTime.message}</p>
                                    )}
                                </div>
                            </div>

                            {/* Mensagem de ajuda para validação de tempo */}
                            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">Dica:</span>
                                </div>
                                <p className="mt-1">
                                    • Para o dia atual: horário pode ser até 1 hora no passado<br />
                                    • Para datas futuras: qualquer horário é permitido<br />
                                    • Não é possível agendar tarefas em datas passadas
                                </p>
                            </div>

                            {watchedType === 'WHATSAPP' && (
                                <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                                    <h3 className="font-semibold text-green-800">Configurações do WhatsApp</h3>
                                    <div>
                                        <Label htmlFor="whatsappMessage">Mensagem</Label>
                                        <Textarea
                                            id="whatsappMessage"
                                            {...register("whatsappMessage")}
                                            placeholder="Digite a mensagem que será enviada..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="sendAutomatically"
                                            onCheckedChange={(checked) => setValue("sendAutomatically", checked)}
                                        />
                                        <Label htmlFor="sendAutomatically">Enviar automaticamente no horário agendado</Label>
                                    </div>
                                    {watchedSendAutomatically && (
                                        <div className="text-sm text-green-600 bg-green-100 p-2 rounded">
                                            ⚡ A mensagem será enviada automaticamente no horário agendado
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button type="submit" className="w-full" disabled={loadingCreate}>
                                {loadingCreate ? "Criando..." : "Criar Tarefa"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar tarefas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        {taskStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                                {status.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        {taskTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                                <span className="flex items-center gap-2">
                                    <span>{type.icon}</span>
                                    {type.label}
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="list">Lista</TabsTrigger>
                    <TabsTrigger value="calendar">Calendário</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Título</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.map((task: Task) => (
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <span className="text-lg">{getTypeIcon(task.type)}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{task.title}</div>
                                            {task.description && (
                                                <div className="text-sm text-gray-500">{task.description}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{task.Responsible?.name}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{format(parseISO(task.scheduledDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                            <span className="text-sm text-gray-500">{task.scheduledTime}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={task.status}
                                            onValueChange={(value) => handleStatusChange(task.id, value)}
                                        >
                                            <SelectTrigger className="w-32">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {taskStatuses.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>
                                                        {status.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredTasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                        Nenhuma tarefa encontrada
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TabsContent>

                <TabsContent value="calendar" className="space-y-4">
                    {/* Navegação do calendário */}
                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
                            Semana Anterior
                        </Button>
                        <h2 className="text-lg font-semibold">
                            {format(startOfWeek(currentWeek), 'dd/MM', { locale: ptBR })} - {format(endOfWeek(currentWeek), 'dd/MM/yyyy', { locale: ptBR })}
                        </h2>
                        <Button variant="outline" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
                            Próxima Semana
                        </Button>
                    </div>

                    {/* Grid do calendário */}
                    <div className="grid grid-cols-7 gap-2">
                        {getWeekDays().map((day, index) => (
                            <div key={index} className="border rounded-lg p-3 min-h-[200px]">
                                <div className="font-semibold text-center mb-2">
                                    <div className="text-xs text-gray-500">
                                        {format(day, 'EEE', { locale: ptBR })}
                                    </div>
                                    <div className="text-lg">
                                        {format(day, 'dd', { locale: ptBR })}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    {getTasksForDay(day).map((task: Task) => (
                                        <div
                                            key={task.id}
                                            className="text-xs p-2 rounded bg-blue-100 border-l-2 border-blue-500"
                                        >
                                            <div className="font-semibold flex items-center gap-1">
                                                <span>{getTypeIcon(task.type)}</span>
                                                {task.scheduledTime}
                                            </div>
                                            <div className="truncate">{task.title}</div>
                                            <div className="text-gray-600">{task.Responsible?.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TarefasPage;
