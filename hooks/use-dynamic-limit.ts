import { useState, useEffect } from 'react';

// Altura aproximada de cada linha da tabela (em pixels)
const ROW_HEIGHT = 64; // altura do TableRow + padding
const HEADER_HEIGHT = 48; // altura do cabeçalho da tabela
const PADDING = 32; // padding da página
const PAGINATION_HEIGHT = 40; // altura do componente de paginação
const PAGINATION_MARGIN = 24; // margem do componente de paginação (mt-6)

export function useDynamicLimit() {
    const [limit, setLimit] = useState(8); // valor inicial

    useEffect(() => {
        const calculateLimit = () => {
            // Obtém a altura da janela
            const windowHeight = window.innerHeight;

            // Calcula a altura disponível para a tabela
            const availableHeight = windowHeight - HEADER_HEIGHT - PADDING - PAGINATION_HEIGHT - PAGINATION_MARGIN;

            // Calcula quantas linhas cabem na altura disponível
            const rowsThatFit = Math.floor(availableHeight / ROW_HEIGHT);

            // Define o limite como o número de linhas que cabem
            setLimit(Math.max(4, rowsThatFit)); // mínimo de 4 itens
        };

        // Calcula o limite inicial
        calculateLimit();

        // Recalcula quando a janela for redimensionada
        window.addEventListener('resize', calculateLimit);

        return () => {
            window.removeEventListener('resize', calculateLimit);
        };
    }, []);

    return limit;
} 