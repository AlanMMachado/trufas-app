import { db } from '@/database/db';
import { Produto, Remessa, RemessaCreateParams } from '../types/Remessa';

export const RemessaService = {
    async create(remessa: RemessaCreateParams): Promise<Remessa> {
        const result = await db.runAsync(
            `INSERT INTO remessas (data, observacao) VALUES (?, ?)`,
            [remessa.data, remessa.observacao || null]
        );
        
        const remessaId = result.lastInsertRowId as number;
        
        // Criar produtos da remessa
        for (const produto of remessa.produtos) {
            const custoPadrao = produto.tipo === 'trufa' ? 2.50 : 5.00;
            await db.runAsync(
                `INSERT INTO produtos (remessa_id, tipo, sabor, quantidade_inicial, custo_producao) 
                 VALUES (?, ?, ?, ?, ?)`,
                [remessaId, produto.tipo, produto.sabor, produto.quantidade_inicial, custoPadrao]
            );
        }
        
        return {
            id: remessaId,
            data: remessa.data,
            observacao: remessa.observacao,
            created_at: new Date().toISOString()
        };
    },

    async getAll(): Promise<Remessa[]> {
        return await db.getAllAsync<Remessa>(`SELECT * FROM remessas ORDER BY id DESC`);
    },

    async getAtivas(): Promise<Remessa[]> {
        return await db.getAllAsync<Remessa>(
            `SELECT DISTINCT r.* FROM remessas r
             INNER JOIN produtos p ON r.id = p.remessa_id
             WHERE (p.quantidade_inicial - p.quantidade_vendida) > 0
             ORDER BY r.id DESC`
        );
    },

    async getById(id: number): Promise<Remessa | null> {
        const remessa = await db.getFirstAsync<Remessa>(
            `SELECT * FROM remessas WHERE id = ?`,
            [id]
        );
        
        if (remessa) {
            const produtos = await db.getAllAsync<Produto>(
                `SELECT * FROM produtos WHERE remessa_id = ?`,
                [id]
            );
            remessa.produtos = produtos;
        }
        
        return remessa;
    },

    async getProdutosByRemessaId(remessaId: number): Promise<Produto[]> {
        return await db.getAllAsync<Produto>(
            `SELECT * FROM produtos WHERE remessa_id = ? ORDER BY tipo, sabor`,
            [remessaId]
        );
    },

    async update(id: number, remessa: Partial<Remessa>): Promise<void> {
        await db.runAsync(
            `UPDATE remessas SET data = ?, observacao = ? WHERE id = ?`,
            [remessa.data || '', remessa.observacao || null, id]
        );
    },

    async delete(id: number): Promise<void> {
        // Deleta produtos primeiro (constraint FK)
        await db.runAsync(`DELETE FROM vendas WHERE produto_id IN (SELECT id FROM produtos WHERE remessa_id = ?)`, [id]);
        await db.runAsync(`DELETE FROM produtos WHERE remessa_id = ?`, [id]);
        await db.runAsync(`DELETE FROM remessas WHERE id = ?`, [id]);
    }
};
