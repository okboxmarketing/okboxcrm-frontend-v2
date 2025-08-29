import { apiHelper } from "@/lib/apiHelper";

export interface Task {
    id: number;
    companyId: string;
    ticketId: number;
    responsibleId: string;
    title: string;
    description?: string;
    type: 'LIGAR' | 'EMAIL' | 'REUNIAO' | 'TAREFA' | 'ALMOCO' | 'VISITA' | 'WHATSAPP' | 'OUTROS';
    scheduledDate: string;
    scheduledTime: string;
    scheduledAt: string;
    sendAutomatically: boolean;
    whatsappMessage?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'DELAYED';
    createdAt: string;
    updatedAt: string;
    Responsible?: {
        id: string;
        name: string;
        email: string;
    };
    Ticket?: {
        id: number;
        Contact: {
            id: string;
            name: string;
            phone: string;
            email?: string;
        };
    };
}

export interface CreateTaskDto {
    ticketId: number;
    title: string;
    description?: string;
    type: 'LIGAR' | 'EMAIL' | 'REUNIAO' | 'TAREFA' | 'ALMOCO' | 'VISITA' | 'WHATSAPP' | 'OUTROS';
    scheduledDate: string;
    scheduledTime: string;
    sendAutomatically?: boolean;
    whatsappMessage?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
    status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'DELAYED';
}

export const createTask = async (data: CreateTaskDto) => {
    return apiHelper.post<Task>('/tasks', data);
};

export const updateTask = async (taskId: number, data: UpdateTaskDto) => {
    return apiHelper.patch<Task>(`/tasks/${taskId}`, data);
};

export const deleteTask = async (taskId: number) => {
    return apiHelper.delete(`/tasks/${taskId}`);
};

export const getTasksByTicket = async (ticketId: number) => {
    return apiHelper.get<Task[]>(`/tasks/ticket/${ticketId}`);
};

export const getTasksByCompany = async () => {
    return apiHelper.get<Task[]>('/tasks/company');
};

export const updateTaskStatus = async (taskId: number, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'DELAYED') => {
    return apiHelper.patch<Task>(`/tasks/${taskId}/status`, { status });
};

export const checkOverdueTasks = async () => {
    return apiHelper.get<{ updatedTasks: number }>('/tasks/overdue/check');
};
