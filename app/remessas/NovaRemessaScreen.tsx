import { useApp } from '@/contexts/AppContext';
import { RemessaService } from '@/service/remessaService';
import { RemessaCreateParams } from '@/types/Remessa';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Text, TextInput } from 'react-native-paper';

interface ProdutoForm {
  tipo: string;
  sabor: string;
  quantidade_inicial: string;
}

export default function NovaRemessaScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [saving, setSaving] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [produtos, setProdutos] = useState<ProdutoForm[]>([
    { tipo: '', sabor: '', quantidade_inicial: '' }
  ]);

  const adicionarProduto = () => {
    setProdutos([...produtos, { tipo: '', sabor: '', quantidade_inicial: '' }]);
  };

  const removerProduto = (index: number) => {
    if (produtos.length > 1) {
      setProdutos(produtos.filter((_, i) => i !== index));
    }
  };

  const atualizarProduto = (index: number, campo: keyof ProdutoForm, valor: string) => {
    const novosProdutos = [...produtos];
    novosProdutos[index][campo] = valor;
    setProdutos(novosProdutos);
  };

  const handleSubmit = async () => {
    const produtosValidos = produtos.filter(p => 
      p.tipo.trim() && p.sabor.trim() && p.quantidade_inicial.trim() && parseInt(p.quantidade_inicial) > 0
    );

    if (produtosValidos.length === 0) {
      alert('Adicione pelo menos um produto válido');
      return;
    }

    try {
      setSaving(true);
      
      const remessaData: RemessaCreateParams = {
        data: new Date().toISOString().split('T')[0],
        observacao: observacao.trim() || undefined,
        produtos: produtosValidos.map(p => ({
          tipo: p.tipo.trim(),
          sabor: p.sabor.trim(),
          quantidade_inicial: parseInt(p.quantidade_inicial)
        }))
      };

      await RemessaService.create(remessaData);
      router.back();
    } catch (error) {
      console.error('Erro ao salvar remessa:', error);
      alert('Erro ao salvar remessa. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nova Remessa</Text>
          <Text style={styles.headerSubtitle}>Registre uma nova entrada de produtos</Text>
        </View>

        {/* Observação */}
        <View style={styles.section}>
          <Text style={styles.label}>Observação (opcional)</Text>
          <TextInput
            value={observacao}
            onChangeText={setObservacao}
            style={styles.textArea}
            mode="outlined"
            multiline
            numberOfLines={3}
            placeholder="Ex: Remessa da segunda-feira..."
            outlineColor="#d1d5db"
            activeOutlineColor="#2563eb"
          />
        </View>

        {/* Produtos */}
        <View style={styles.produtosSection}>
          <View style={styles.produtosHeader}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{produtos.length}</Text>
            </View>
          </View>

          {produtos.map((produto, index) => (
            <View key={index} style={styles.produtoCard}>
              <View style={styles.produtoHeader}>
                <View style={styles.produtoNumber}>
                  <Text style={styles.produtoNumberText}>#{index + 1}</Text>
                </View>
                {produtos.length > 1 && (
                  <TouchableOpacity 
                    onPress={() => removerProduto(index)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tipo */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.tipoButtons}>
                  <TouchableOpacity
                    onPress={() => atualizarProduto(index, 'tipo', 'trufa')}
                    style={[
                      styles.tipoButton,
                      produto.tipo === 'trufa' && styles.tipoButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.tipoButtonText,
                      produto.tipo === 'trufa' && styles.tipoButtonTextActive
                    ]}>
                      Trufa
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => atualizarProduto(index, 'tipo', 'sobremesa')}
                    style={[
                      styles.tipoButton,
                      produto.tipo === 'sobremesa' && styles.tipoButtonActive
                    ]}
                  >
                    <Text style={[
                      styles.tipoButtonText,
                      produto.tipo === 'sobremesa' && styles.tipoButtonTextActive
                    ]}>
                      Sobremesa
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sabor */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sabor *</Text>
                <TextInput
                  value={produto.sabor}
                  onChangeText={(text) => atualizarProduto(index, 'sabor', text)}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Ex: Morango, Chocolate..."
                  outlineColor="#d1d5db"
                  activeOutlineColor="#2563eb"
                />
              </View>

              {/* Quantidade */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Quantidade Inicial *</Text>
                <TextInput
                  value={produto.quantidade_inicial}
                  onChangeText={(text) => atualizarProduto(index, 'quantidade_inicial', text)}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  placeholder="Ex: 20"
                  outlineColor="#d1d5db"
                  activeOutlineColor="#2563eb"
                />
              </View>
            </View>
          ))}

          {/* Botão Adicionar */}
          <TouchableOpacity
            onPress={adicionarProduto}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Adicionar Produto</Text>
          </TouchableOpacity>
        </View>

        {/* Botões de Ação */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, saving && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <Text style={styles.submitButtonText}>Criar Remessa</Text>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: 20,
    paddingTop: 8,
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
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#ffffff',
  },
  produtosSection: {
    marginBottom: 20,
  },
  produtosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
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
  produtoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  produtoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  produtoNumberText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#6b7280',
    fontSize: 24,
    fontWeight: '300',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#ffffff',
  },
  tipoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  tipoButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#2563eb',
  },
  tipoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tipoButtonTextActive: {
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});