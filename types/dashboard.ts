export type DashboardData = {
    totalVendas: number;
    valorTotalVendas: number;
    ticketMedio: number;
    totalConversas: number;
    taxaConversao: number;
    conversasPorDia: {
        dia: string;
        quantidade: number;
    }[];
    totalPerdas: number;
    composicaoKanban: {
        etapa: string;
        quantidade: number;
        color: string;
    }[];
    rankingMotivosPerda: {
        motivo: string;
        quantidade: number;
    }[];
    tempoMedioResposta?: number;
    tempoMedioFechamento?: number;
    etapasFinalizacao: {
        etapa: string;
        tipo: 'ganho' | 'perdido';
        quantidade: number;
    }[];
};
