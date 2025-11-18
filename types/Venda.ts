export interface Venda {
    id: number;
    produto_id: number;
    cliente: string | null;
    quantidade_vendida: number;
    preco: number;
    data: string; // ISO string
    status: 'OK' | 'PENDENTE';
    metodo_pagamento?: string;
    created_at?: string;
}

export interface VendaCreateParams {
    produto_id: number;
    cliente: string;
    quantidade_vendida: number;
    preco: number;
    data: string;
    status: 'OK' | 'PENDENTE';
    metodo_pagamento?: string;
}