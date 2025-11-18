import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { VendaService } from '@/service/vendaService';
import { RemessaService } from '@/service/remessaService';
import { Produto } from '@/types/Remessa';
import { useApp } from '@/contexts/AppContext';

export default function NovaVendaScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [formData, setFormData] = useState({
    produto_id: '',
    cliente: '',
    quantidade_vendida: '1',
    preco: '',
    status: 'OK' as 'OK' | 'PENDENTE',
    metodo_pagamento: ''
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      // Carregar produtos das remessas ativas
      const remessasAtivas = await RemessaService.getAtivas();
      const todosProdutos: Produto[] = [];
      
      for (const remessa of remessasAtivas) {
        const produtosRemessa = await RemessaService.getProdutosByRemessaId(remessa.id);
        const produtosDisponiveis = produtosRemessa.filter(p => 
          p.quantidade_inicial - p.quantidade_vendida > 0
        );
        todosProdutos.push(...produtosDisponiveis);
      }
      
      setProdutos(todosProdutos);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.produto_id || !formData.preco || !formData.cliente) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    try {
      setSaving(true);
      const venda = await VendaService.create({
        produto_id: parseInt(formData.produto_id),
        cliente: formData.cliente,
        quantidade_vendida: parseInt(formData.quantidade_vendida),
        preco: parseFloat(formData.preco),
        data: new Date().toISOString().split('T')[0],
        status: formData.status,
        metodo_pagamento: formData.metodo_pagamento || undefined
      });

      dispatch({ type: 'ADD_VENDA', payload: venda });
      
      // Limpar formulário e voltar
      router.back();
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao salvar venda. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" style={styles.loading} />
      </View>
    );
  }

  if (produtos.length === 0) {
    return (
      <View style={styles.container}>
        <Card style={styles.emptyCard}>
          <Card.Content>
            <Text style={styles.emptyText}>Nenhum produto disponível</Text>
            <Text style={styles.emptySubtext}>Crie uma remessa com produtos primeiro</Text>
            <Button 
              mode="contained" 
              onPress={() => router.push('/remessas/nova')}
              style={styles.emptyButton}
            >
              Criar Remessa
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card style={styles.formCard}>
          <Card.Title title="Nova Venda" />
          <Card.Content>
            {/* Seleção de Produto */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Produto *</Text>
              <View style={styles.produtoButtons}>
                {produtos.map((produto) => (
                  <Button
                    key={produto.id}
                    mode={formData.produto_id === produto.id.toString() ? 'contained' : 'outlined'}
                    onPress={() => setFormData({ ...formData, produto_id: produto.id.toString() })}
                    style={styles.produtoButton}
                    compact
                  >
                    {produto.tipo} - {produto.sabor}
                  </Button>
                ))}
              </View>
            </View>

            {/* Cliente */}
            <TextInput
              label="Cliente *"
              value={formData.cliente}
              onChangeText={(text) => setFormData({ ...formData, cliente: text })}
              style={styles.input}
              mode="outlined"
            />

            {/* Quantidade */}
            <TextInput
              label="Quantidade *"
              value={formData.quantidade_vendida}
              onChangeText={(text) => setFormData({ ...formData, quantidade_vendida: text })}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            {/* Preço */}
            <TextInput
              label="Preço (R$) *"
              value={formData.preco}
              onChangeText={(text) => setFormData({ ...formData, preco: text })}
              keyboardType="numeric"
              style={styles.input}
              mode="outlined"
            />

            {/* Método de Pagamento */}
            <TextInput
              label="Método de Pagamento"
              value={formData.metodo_pagamento}
              onChangeText={(text) => setFormData({ ...formData, metodo_pagamento: text })}
              style={styles.input}
              mode="outlined"
              placeholder="Ex: Dinheiro, Cartão, Pix"
            />

            {/* Status de Pagamento */}
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status de Pagamento:</Text>
              <View style={styles.statusSwitch}>
                <Text style={[
                  styles.statusText,
                  formData.status === 'OK' && styles.statusTextActive
                ]}>
                  PAGO
                </Text>
                <Switch
                  value={formData.status === 'PENDENTE'}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    status: value ? 'PENDENTE' : 'OK' 
                  })}
                  color="#F44336"
                />
                <Text style={[
                  styles.statusText,
                  formData.status === 'PENDENTE' && styles.statusTextActive
                ]}>
                  PENDENTE
                </Text>
              </View>
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <Button 
                mode="outlined" 
                onPress={() => router.back()}
                style={styles.button}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                style={styles.button}
                loading={saving}
                disabled={saving}
              >
                Confirmar Venda
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
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
  emptyCard: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 16,
  },
  formCard: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  produtoButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  produtoButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  statusTextActive: {
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});