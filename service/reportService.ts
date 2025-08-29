import { apiHelper } from "@/lib/apiHelper";

export enum ReportExtension {
    XLSX = 'xlsx',
    PDF = 'pdf',
    CSV = 'csv'
}

export enum SaleReportType {
    SUMMARY = 'summary',
    DETAILED = 'detailed'
}

interface SalesReportParams {
    startDate: string;
    endDate: string;
    extension: ReportExtension;
}

interface SalesReportResponse {
    reportId: number;
    link: string;
    status: string;
    message: string;
}

export const generateSalesReport = async (params: SalesReportParams): Promise<SalesReportResponse> => {
    try {
        const queryParams = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
            extension: params.extension
        });

        const response = await apiHelper.get<SalesReportResponse>(`/reports/sales?${queryParams.toString()}`);

        if (response.link) {
            // Abrir o link do relatório em uma nova aba
            window.open(response.link, '_blank');
        }

        return response;
    } catch (error: any) {
        console.error("Error generating sales report:", error);

        // Extrair mensagem de erro específica do backend
        let errorMessage = "Erro ao gerar relatório";

        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.message) {
            errorMessage = error.message;
        }

        // Criar um erro customizado com a mensagem específica
        const customError = new Error(errorMessage);
        customError.name = 'ReportGenerationError';
        throw customError;
    }
};

interface LossReportParams {
    startDate: string;
    endDate: string;
    extension: ReportExtension;
}

export const generateLossReport = async (params: LossReportParams): Promise<SalesReportResponse> => {
    try {
        const queryParams = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
            extension: params.extension
        });
        const response = await apiHelper.get<SalesReportResponse>(`/reports/losses?${queryParams.toString()}`);
        if (response.link) {
            window.open(response.link, '_blank');
        }
        return response;
    } catch (error: any) {
        console.error("Error generating loss report:", error);
        let errorMessage = "Erro ao gerar relatório";
        if (error.response?.data?.message) { errorMessage = error.response.data.message; }
        else if (error.response?.data?.error) { errorMessage = error.response.data.error; }
        else if (error.message) { errorMessage = error.message; }
        const customError = new Error(errorMessage);
        customError.name = 'ReportGenerationError';
        throw customError;
    }
};

interface DashboardReportParams {
    startDate: string;
    endDate: string;
    extension: ReportExtension;
}

export const generateDashboardReport = async (params: DashboardReportParams): Promise<SalesReportResponse> => {
    try {
        const queryParams = new URLSearchParams({
            startDate: params.startDate,
            endDate: params.endDate,
            extension: params.extension
        });
        const response = await apiHelper.get<SalesReportResponse>(`/reports/dashboard?${queryParams.toString()}`);
        if (response.link) {
            window.open(response.link, '_blank');
        }
        return response;
    } catch (error: any) {
        console.error("Error generating dashboard report:", error);
        let errorMessage = "Erro ao gerar relatório";
        if (error.response?.data?.message) { errorMessage = error.response.data.message; }
        else if (error.response?.data?.error) { errorMessage = error.response.data.error; }
        else if (error.message) { errorMessage = error.message; }
        const customError = new Error(errorMessage);
        customError.name = 'ReportGenerationError';
        throw customError;
    }
};
