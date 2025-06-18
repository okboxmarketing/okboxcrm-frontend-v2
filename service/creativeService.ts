import { Creative } from "@/app/(authenticated)/home/criativos/page"
import { apiHelper } from "@/lib/apiHelper"

interface CreateCreativeDto {
    title: string
    keyphrase: string
}

export const createCreative = async (data: CreateCreativeDto) => {
    return apiHelper.post('/creative', data)
}

export const getCreatives = async () => {
    return apiHelper.get<Creative[]>('/creative')
}

export const assignCreative = async (ticketId: number, creativeId: number) => {
    return apiHelper.post(`/tickets/assign/creative/${ticketId}`, { creativeId })
}
