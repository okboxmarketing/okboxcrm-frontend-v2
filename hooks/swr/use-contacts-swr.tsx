import useSWR from 'swr';
import { getContacts } from '@/service/contactService';

export function useContacts(page: number, limit: number = 8, search?: string) {
    const { data, error, isLoading, mutate, isValidating } = useSWR(
        ['contacts', page, limit, search],
        () => getContacts(page, limit, search),
        {
            revalidateOnFocus: true,
            keepPreviousData: true,
        }
    );

    return {
        contacts: data?.data ?? [],
        totalPages: data?.totalPages ?? 1,
        total: data?.total ?? 0,
        loading: isLoading,
        error,
        mutate,
        isValidating,
    };
}
