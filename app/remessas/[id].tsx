import { RemessaService } from '@/service/remessaService';
import { VendaService } from '@/service/vendaService';
import { Remessa } from '@/types/Remessa';
import { Venda } from '@/types/Venda';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function DetalhesRemessaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [remessa, setRemessa] = useState<Remessa | null>(null);
  const [vendas, setVendas] = useState<Venda[]>([]);

  useEffect(() => {
    if (id) {
      carregarDetalhes();
    }
  }, [id]);

  const carregarDetalhes = async () => {
    try {
      setLoading(true);
      const remessaData = await RemessaService.getById(parseInt(id));
      setRemessa(remessaData);
      
      if (remessaData?.produtos) {
        const todasVendas: Venda[] = [];
        for (const produto of remessaData.produtos) {
          const vendasProduto = await VendaService.getByProduto(produto.id);
          todasVendas.push(...vendasProduto);
        }
        setVendas(todasVendas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()));
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={styles.loading} />
      </View>
    );
  }

  if (!remessa) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Remessa não encontrada</Text>
        </View>
      </View>
    );
  }

  const getTotalVendido = () => {
    if (!remessa.produtos) return 0;
    return remessa.produtos.reduce((total, produto) => total + produto.quantidade_vendida, 0);
  };

  const getTotalInicial = () => {
    if (!remessa.produtos) return 0;
    return remessa.produtos.reduce((total, produto) => total + produto.quantidade_inicial, 0);
  };

  const getValorTotalVendido = () => {
    return vendas
      .filter(venda => venda.status === 'OK')
      .reduce((total, venda) => total + venda.preco, 0);
  };

  const getValorPendente = () => {
    return vendas
      .filter(venda => venda.status === 'PENDENTE')
      .reduce((total, venda) => total + venda.preco, 0);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>📦</Text>
          <Text style={styles.headerTitle}>
            {format(parseISO(remessa.data), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </Text>
          {remessa.observacao && (
            <Text style={styles.headerObservacao}>{remessa.observacao}</Text>
          )}
        </View>

        {/* KPIs */}
        <View style={styles.kpisGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Total Inicial</Text>
            <Text style={styles.kpiValue}>{getTotalInicial()}</Text>
            <Text style={styles.kpiSubtext}>unidades</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Vendido</Text>
            <Text style={styles.kpiValue}>{getTotalVendido()}</Text>
            <Text style={styles.kpiSubtext}>unidades</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Disponível</Text>
            <Text style={styles.kpiValue}>{getTotalInicial() - getTotalVendido()}</Text>
            <Text style={styles.kpiSubtext}>unidades</Text>
          </View>

          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Faturamento</Text>
            <Text style={styles.kpiValue}>R$ {getValorTotalVendido().toFixed(0)}</Text>
            <Text style={styles.kpiSubtext}>recebido</Text>
          </View>
        </View>

        {/* Produtos */}
        <View style={styles.produtosSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{remessa.produtos?.length || 0}</Text>
            </View>
          </View>

          {remessa.produtos?.map((produto) => (
            <View key={produto.id} style={styles.produtoItem}>
              <View style={styles.produtoHeader}>
                <Text style={styles.produtoNome}>
                  {produto.tipo} - {produto.sabor}
                </Text>
                <Text style={styles.produtoCusto}>
                  Custo: R$ {produto.custo_producao.toFixed(2)}
                </Text>
              </View>

              <View style={styles.produtoProgress}>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {produto.quantidade_vendida}/{produto.quantidade_inicial}
                  </Text>
                  <Text style={styles.progressPercentage}>
                    {((produto.quantidade_vendida / produto.quantidade_inicial) * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(produto.quantidade_vendida / produto.quantidade_inicial) * 100}%` }
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  {produto.quantidade_inicial === produto.quantidade_vendida
                    ? 'Esgotado'
                    : produto.quantidade_vendida === 0
                      ? 'Novo'
                      : `${produto.quantidade_inicial - produto.quantidade_vendida} disponíveis`
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Vendas */}
        {vendas.length > 0 && (
          <View style={styles.vendasSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Vendas</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{vendas.length}</Text>
              </View>
            </View>

            {/* Resumo Financeiro */}
            <View style={styles.vendasResumo}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Recebido</Text>
                <Text style={styles.resumoValor}>R$ {getValorTotalVendido().toFixed(2)}</Text>
              </View>
              {getValorPendente() > 0 && (
                <View style={styles.resumoItem}>
                  <Text style={styles.resumoLabel}>Pendente</Text>
                  <Text style={styles.resumoValor}>R$ {getValorPendente().toFixed(2)}</Text>
                </View>
              )}
            </View>

            {/* Lista de Vendas */}
            {vendas.slice(0, 10).map((venda) => (
              <View key={venda.id} style={styles.vendaItem}>
                <View style={styles.vendaInfo}>
                  <Text style={styles.vendaCliente}>{venda.cliente}</Text>
                  <Text style={styles.vendaData}>
                    {format(parseISO(venda.data), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </Text>
                </View>
                <View style={styles.vendaValores}>
                  <Text style={styles.vendaPreco}>R$ {venda.preco.toFixed(2)}</Text>
                  <View style={[
                    styles.vendaStatus,
                    venda.status === 'OK' ? styles.statusPago : styles.statusPendente
                  ]}>
                    <Text style={[
                      styles.vendaStatusText,
                      venda.status === 'OK' ? styles.statusTextPago : styles.statusTextPendente
                    ]}>
                      {venda.status === 'OK' ? 'Pago' : 'Pendente'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
            {vendas.length > 10 && (
              <Text style={styles.maisVendas}>
                ... e mais {vendas.length - 10} vendas
              </Text>
            )}
          </View>
        )}

        {/* Botão Nova Venda */}
        <TouchableOpacity 
          style={styles.novaVendaButton}
          onPress={() => router.push('/vendas/NovaVendaScreen')}
        >
          <Text style={styles.novaVendaText}>+ Registrar Nova Venda</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  loading: {
    marginTop: 50,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerObservacao: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  kpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  kpiLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  kpiSubtext: {
    fontSize: 11,
    color: '#9ca3af',
  },
  produtosSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  produtoItem: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  produtoHeader: {
    marginBottom: 12,
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  produtoCusto: {
    fontSize: 12,
    color: '#6b7280',
  },
  produtoProgress: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  vendasSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 16,
  },
  vendasResumo: {
    flexDirection: 'row',
    gap: 20,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resumoItem: {
    flex: 1,
  },
  resumoLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  vendaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  vendaInfo: {
    flex: 1,
  },
  vendaCliente: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  vendaData: {
    fontSize: 11,
    color: '#6b7280',
  },
  vendaValores: {
    alignItems: 'flex-end',
  },
  vendaPreco: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  vendaStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPago: {
    backgroundColor: '#dbeafe',
  },
  statusPendente: {
    backgroundColor: '#e5e7eb',
  },
  vendaStatusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusTextPago: {
    color: '#2563eb',
  },
  statusTextPendente: {
    color: '#6b7280',
  },
  maisVendas: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  novaVendaButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  novaVendaText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});