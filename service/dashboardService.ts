import { DashboardData } from '@/types/dashboard';
import { apiHelper } from '@/lib/apiHelper';

export const getDashboardData = async (
    startDate: string,
    endDate: string
): Promise<DashboardData> => {
    const response = await apiHelper.get<DashboardData>(`/dashboard?startDate=${startDate}&endDate=${endDate}`);
    return response;
};
