export interface FunilVendas {
    etapa: string;
    valor: number;
    taxa: number;
}

export interface KanbanEtapa {
    etapa: string;
    quantidade: number;
    color: string;
}

export interface DashboardData {
    totalConversas: number;
    totalVendas: number;
    valorTotalVendas: number;
    ticketMedio: number;
    taxaConversao: number;
    conversasPorDia: {
        dia: string;
        quantidade: number;
    }[];
    totalPerdas: number;
    composicaoKanban: KanbanEtapa[];
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
    funilVendas: FunilVendas[];
    etapaAoPerder: {
        etapa: string;
        quantidade: number;
    }[];

    // Métricas dos criativos
    totalCaptacoesPorCriativos: number;
    rankingCaptacoesPorCriativos: {
        criativo: string;
        quantidade: number;
    }[];
    rankingCaptacoesPorOrigem: {
        origem: string;
        quantidade: number;
    }[];
    conversoesPorCriativo: {
        nomeCriativo: string;
        leadsCaptados: number;
        conversoes: number;
        taxaConversao: number;
    }[];
}
