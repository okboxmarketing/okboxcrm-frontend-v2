import { apiHelper } from "@/lib/apiHelper"

interface CreateCreativeDto {
    title: string
    keyphrase: string
}

export const createCreative = async (data: CreateCreativeDto) => {
    return apiHelper.post('/creative', data)
}

export const getCreatives = async () => {
    return apiHelper.get('/creative')
}
