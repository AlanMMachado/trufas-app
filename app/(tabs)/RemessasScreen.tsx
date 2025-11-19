import { RemessaService } from '@/service/remessaService';
import { Remessa } from '@/types/Remessa';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

export default function RemessasScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [remessas, setRemessas] = useState<Remessa[]>([]);

  useEffect(() => {
    carregarRemessas();
  }, []);

  const carregarRemessas = async () => {
    try {
      setLoading(true);
      const todasRemessas = await RemessaService.getAll();
      setRemessas(todasRemessas);
    } catch (error) {
      console.error('Erro ao carregar remessas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusRemessa = (remessa: Remessa) => {
    if (!remessa.produtos || remessa.produtos.length === 0) return 'Sem produtos';
    
    const totalInicial = remessa.produtos.reduce((sum, p) => sum + p.quantidade_inicial, 0);
    const totalVendido = remessa.produtos.reduce((sum, p) => sum + p.quantidade_vendida, 0);
    const disponivel = totalInicial - totalVendido;
    
    if (disponivel === 0) return 'Esgotada';
    if (totalVendido === 0) return 'Nova';
    return `${disponivel} disponíveis`;
  };

  const getProgressPercentage = (remessa: Remessa) => {
    if (!remessa.produtos || remessa.produtos.length === 0) return 0;
    
    const totalInicial = remessa.produtos.reduce((sum, p) => sum + p.quantidade_inicial, 0);
    const totalVendido = remessa.produtos.reduce((sum, p) => sum + p.quantidade_vendida, 0);
    
    return totalInicial > 0 ? (totalVendido / totalInicial) * 100 : 0;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" style={styles.loading} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Remessas</Text>
        <Text style={styles.headerSubtitle}>
          {remessas.length} {remessas.length === 1 ? 'remessa' : 'remessas'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {remessas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyText}>Nenhuma remessa cadastrada</Text>
            <Text style={styles.emptySubtext}>
              Crie sua primeira remessa para começar
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push('/remessas/NovaRemessaScreen')}
            >
              <Text style={styles.emptyButtonText}>+ Criar Primeira Remessa</Text>
            </TouchableOpacity>
          </View>
        ) : (
          remessas.map((remessa) => (
            <TouchableOpacity
              key={remessa.id}
              onPress={() => router.push(`/remessas/${remessa.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.remessaCard}>
                {/* Header */}
                <View style={styles.remessaHeader}>
                  <View style={styles.remessaDateContainer}>
                    <Text style={styles.remessaDateLabel}>Data</Text>
                    <Text style={styles.remessaData}>
                      {format(parseISO(remessa.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </Text>
                  </View>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{getStatusRemessa(remessa)}</Text>
                  </View>
                </View>

                {/* Observação */}
                {remessa.observacao && (
                  <View style={styles.observacaoContainer}>
                    <Text style={styles.observacaoText}>{remessa.observacao}</Text>
                  </View>
                )}

                {/* Progress */}
                {remessa.produtos && remessa.produtos.length > 0 && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressInfo}>
                      <Text style={styles.progressLabel}>Progresso</Text>
                      <Text style={styles.progressPercentage}>
                        {getProgressPercentage(remessa).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.progressContainer}>
                      <View 
                        style={[styles.progressFill, { width: `${getProgressPercentage(remessa)}%` }]}
                      />
                    </View>
                  </View>
                )}

                {/* Produtos */}
                {remessa.produtos && remessa.produtos.length > 0 && (
                  <View style={styles.produtosContainer}>
                    <Text style={styles.produtosTitle}>
                      Produtos ({remessa.produtos.length})
                    </Text>
                    {remessa.produtos.slice(0, 3).map((produto) => (
                      <View key={produto.id} style={styles.produtoItem}>
                        <Text style={styles.produtoNome}>
                          {produto.tipo} - {produto.sabor}
                        </Text>
                        <Text style={styles.produtoQuantidade}>
                          {produto.quantidade_inicial - produto.quantidade_vendida}/{produto.quantidade_inicial}
                        </Text>
                      </View>
                    ))}
                    {remessa.produtos.length > 3 && (
                      <Text style={styles.maisItens}>
                        + {remessa.produtos.length - 3} produtos
                      </Text>
                    )}
                  </View>
                )}

                {/* Footer */}
                <View style={styles.remessaFooter}>
                  <Text style={styles.verDetalhes}>Ver detalhes →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/remessas/NovaRemessaScreen')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loading: {
    marginTop: 50,
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 40,
    marginTop: 50,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  remessaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 20,
    marginBottom: 12,
  },
  remessaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  remessaDateContainer: {
    flex: 1,
  },
  remessaDateLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  remessaData: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  observacaoContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  observacaoText: {
    fontSize: 13,
    color: '#374151',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  progressPercentage: {
    fontSize: 14,
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
  produtosContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  produtosTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  produtoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  produtoQuantidade: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  maisItens: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 4,
  },
  remessaFooter: {
    alignItems: 'flex-end',
  },
  verDetalhes: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '300',
  },
});