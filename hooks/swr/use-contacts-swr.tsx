import useSWR from 'swr';
import { getContacts } from '@/service/contactService';

export function useContacts(page: number, limit: number = 8) {
    const { data, error, isLoading, mutate, isValidating } = useSWR(
        ['contacts', page, limit],
        () => getContacts(page, limit),
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
