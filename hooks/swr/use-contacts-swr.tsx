import useSWR from 'swr';
import { getContacts } from '@/service/contactService';

export function useContacts(page: number) {
    const { data, error, isLoading, mutate, isValidating } = useSWR(
        ['contacts', page],
        () => getContacts(page),
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
