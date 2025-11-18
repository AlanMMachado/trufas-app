import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, ActivityIndicator, FAB } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RemessaService } from '@/service/remessaService';
import { VendaService } from '@/service/vendaService';
import { Remessa } from '@/types/Remessa';
import { Venda } from '@/types/Venda';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
        // Carregar vendas dos produtos desta remessa
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
        <ActivityIndicator size="large" style={styles.loading} />
      </View>
    );
  }

  if (!remessa) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Remessa não encontrada</Text>
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Informações da Remessa */}
        <Card style={styles.infoCard}>
          <Card.Title 
            title={`Remessa - ${format(parseISO(remessa.data), 'dd/MM/yyyy', { locale: ptBR })}`}
            subtitle={remessa.observacao}
          />
          <Card.Content>
            <View style={styles.resumoContainer}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Total Inicial:</Text>
                <Text style={styles.resumoValor}>{getTotalInicial()} unidades</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Total Vendido:</Text>
                <Text style={styles.resumoValor}>{getTotalVendido()} unidades</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Disponível:</Text>
                <Text style={styles.resumoValor}>{getTotalInicial() - getTotalVendido()} unidades</Text>
              </View>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoLabel}>Valor Total:</Text>
                <Text style={[styles.resumoValor, styles.valorDestaque]}>
                  R$ {getValorTotalVendido().toFixed(2)}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Produtos */}
        <Card style={styles.produtosCard}>
          <Card.Title title="Produtos" />
          <Card.Content>
            {remessa.produtos?.map((produto) => (
              <View key={produto.id} style={styles.produtoItem}>
                <View style={styles.produtoInfo}>
                  <Text style={styles.produtoNome}>
                    {produto.tipo} - {produto.sabor}
                  </Text>
                  <Text style={styles.produtoDetalhes}>
                    Custo: R$ {produto.custo_producao.toFixed(2)} | 
                    Disponível: {produto.quantidade_inicial - produto.quantidade_vendida}
                  </Text>
                </View>
                <View style={styles.produtoVendas}>
                  <Text style={styles.vendidosText}>
                    {produto.quantidade_vendida}/{produto.quantidade_inicial}
                  </Text>
                  <Text style={styles.percentualText}>
                    {((produto.quantidade_vendida / produto.quantidade_inicial) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* Vendas */}
        {vendas.length > 0 && (
          <Card style={styles.vendasCard}>
            <Card.Title title={`Vendas (${vendas.length})`} />
            <Card.Content>
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
                    <Text style={[
                      styles.vendaStatus,
                      venda.status === 'OK' ? styles.statusOK : styles.statusPendente
                    ]}>
                      {venda.status}
                    </Text>
                  </View>
                </View>
              ))}
              {vendas.length > 10 && (
                <Text style={styles.maisVendasText}>
                  ... e mais {vendas.length - 10} vendas
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
      </View>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => router.push('/vendas/nova')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loading: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#F44336',
  },
  infoCard: {
    marginBottom: 16,
  },
  resumoContainer: {
    marginTop: 8,
  },
  resumoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resumoLabel: {
    fontSize: 16,
    color: '#666',
  },
  resumoValor: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  valorDestaque: {
    color: '#4CAF50',
    fontSize: 18,
  },
  produtosCard: {
    marginBottom: 16,
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  produtoInfo: {
    flex: 1,
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  produtoDetalhes: {
    fontSize: 14,
    color: '#666',
  },
  produtoVendas: {
    alignItems: 'flex-end',
  },
  vendidosText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  percentualText: {
    fontSize: 14,
    color: '#666',
  },
  vendasCard: {
    marginBottom: 16,
  },
  vendaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vendaInfo: {
    flex: 1,
  },
  vendaCliente: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  vendaData: {
    fontSize: 12,
    color: '#666',
  },
  vendaValores: {
    alignItems: 'flex-end',
  },
  vendaPreco: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  vendaStatus: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusOK: {
    color: '#4CAF50',
  },
  statusPendente: {
    color: '#F44336',
  },
  maisVendasText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});