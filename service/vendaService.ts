import { db } from '@/database/db';
import { Venda, VendaCreateParams } from '../types/Venda';

export const VendaService = {
    async create(venda: VendaCreateParams): Promise<Venda> {
        const result = await db.runAsync(
            `INSERT INTO vendas (produto_id, cliente, quantidade_vendida, preco, data, status, metodo_pagamento)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                venda.produto_id,
                venda.cliente,
                venda.quantidade_vendida,
                venda.preco,
                venda.data,
                venda.status,
                venda.metodo_pagamento || null
            ]
        );

        // Atualiza quantidade vendida do produto
        await db.runAsync(
            `UPDATE produtos 
             SET quantidade_vendida = quantidade_vendida + ?
             WHERE id = ?`,
            [venda.quantidade_vendida, venda.produto_id]
        );

        return { 
            id: result.lastInsertRowId as number, 
            ...venda,
            metodo_pagamento: venda.metodo_pagamento || undefined,
            created_at: new Date().toISOString()
        };
    },

    async getByProduto(produtoId: number): Promise<Venda[]> {
        return await db.getAllAsync<Venda>(
            `SELECT * FROM vendas WHERE produto_id = ? ORDER BY data DESC`,
            [produtoId]
        );
    },

    async getById(id: number): Promise<Venda | null> {
        return await db.getFirstAsync<Venda>(
            `SELECT * FROM vendas WHERE id = ?`,
            [id]
        );
    },

    async updateStatus(id: number, status: 'OK' | 'PENDENTE'): Promise<void> {
        await db.runAsync(
            `UPDATE vendas SET status = ? WHERE id = ?`,
            [status, id]
        );
    },

    async getByPeriodo(inicio: string, fim: string): Promise<Venda[]> {
        return await db.getAllAsync<Venda>(
            `SELECT * FROM vendas WHERE data BETWEEN ? AND ? ORDER BY data DESC`,
            [inicio, fim]
        );
    },

    async getVendasRecentes(limit: number = 10): Promise<Venda[]> {
        return await db.getAllAsync<Venda>(
            `SELECT * FROM vendas ORDER BY created_at DESC LIMIT ?`,
            [limit]
        );
    },

    async getTotalVendidoPorPeriodo(inicio: string, fim: string): Promise<number> {
        const result = await db.getFirstAsync<{ total: number }>(
            `SELECT SUM(preco) as total FROM vendas WHERE data BETWEEN ? AND ? AND status = 'OK'`,
            [inicio, fim]
        );
        return result?.total || 0;
    },

    async getTotalPendentePorPeriodo(inicio: string, fim: string): Promise<number> {
        const result = await db.getFirstAsync<{ total: number }>(
            `SELECT SUM(preco) as total FROM vendas WHERE data BETWEEN ? AND ? AND status = 'PENDENTE'`,
            [inicio, fim]
        );
        return result?.total || 0;
    },

    async delete(id: number): Promise<void> {
        // Busca a venda antes de deletar para ajustar a quantidade
        const venda = await this.getById(id);
        if (venda) {
            await db.runAsync(
                `UPDATE produtos 
                 SET quantidade_vendida = quantidade_vendida - ?
                 WHERE id = ?`,
                [venda.quantidade_vendida, venda.produto_id]
            );
        }
        
        await db.runAsync(`DELETE FROM vendas WHERE id = ?`, [id]);
    }
};