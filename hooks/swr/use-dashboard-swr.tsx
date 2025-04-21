import useSWR from 'swr';
import { getDashboardData } from '@/service/dashboardService';
import { DashboardData } from '@/types/dashboard';

export function useDashboardData(startDate?: string, endDate?: string) {
    const isValidRange = !!startDate && !!endDate;

    const { data, error, isLoading, isValidating, mutate } = useSWR<DashboardData>(
        isValidRange ? [`/dashboard`, startDate, endDate] : null,
        () => getDashboardData(startDate!, endDate!),
        {
            revalidateOnFocus: true,
            revalidateIfStale: true,
            refreshInterval: 0,
        }
    );

    return {
        data,
        loading: isLoading,
        error,
        isValidating,
        mutate,
    };
}
