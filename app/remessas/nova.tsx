import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, ActivityIndicator, List, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { RemessaService } from '@/service/remessaService';
import { RemessaCreateParams } from '@/types/Remessa';
import { useApp } from '@/contexts/AppContext';

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
    // Validar produtos
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
      
      // Voltar para lista de remessas
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
        <Card style={styles.formCard}>
          <Card.Title title="Nova Remessa" />
          <Card.Content>
            {/* Observação */}
            <TextInput
              label="Observação (opcional)"
              value={observacao}
              onChangeText={setObservacao}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
            />

            {/* Produtos */}
            <Text style={styles.sectionTitle}>Produtos</Text>
            {produtos.map((produto, index) => (
              <Card key={index} style={styles.produtoCard}>
                <Card.Content>
                  <View style={styles.produtoHeader}>
                    <Text style={styles.produtoTitle}>Produto {index + 1}</Text>
                    {produtos.length > 1 && (
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => removerProduto(index)}
                      />
                    )}
                  </View>
                  
                  <View style={styles.produtoRow}>
                    <View style={styles.tipoContainer}>
                      <Text style={styles.label}>Tipo</Text>
                      <View style={styles.tipoButtons}>
                        <Button
                          mode={produto.tipo === 'trufa' ? 'contained' : 'outlined'}
                          onPress={() => atualizarProduto(index, 'tipo', 'trufa')}
                          style={styles.tipoButton}
                          compact
                        >
                          Trufa
                        </Button>
                        <Button
                          mode={produto.tipo === 'sobremesa' ? 'contained' : 'outlined'}
                          onPress={() => atualizarProduto(index, 'tipo', 'sobremesa')}
                          style={styles.tipoButton}
                          compact
                        >
                          Sobremesa
                        </Button>
                      </View>
                    </View>
                  </View>

                  <TextInput
                    label="Sabor"
                    value={produto.sabor}
                    onChangeText={(text) => atualizarProduto(index, 'sabor', text)}
                    style={styles.input}
                    mode="outlined"
                  />

                  <TextInput
                    label="Quantidade Inicial"
                    value={produto.quantidade_inicial}
                    onChangeText={(text) => atualizarProduto(index, 'quantidade_inicial', text)}
                    keyboardType="numeric"
                    style={styles.input}
                    mode="outlined"
                  />
                </Card.Content>
              </Card>
            ))}

            <Button
              mode="outlined"
              onPress={adicionarProduto}
              style={styles.adicionarButton}
              icon="plus"
            >
              Adicionar Produto
            </Button>

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
                Criar Remessa
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
  formCard: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  produtoCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  produtoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  produtoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  produtoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  tipoContainer: {
    marginBottom: 12,
  },
  tipoButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  tipoButton: {
    flex: 1,
  },
  adicionarButton: {
    marginTop: 16,
    marginBottom: 24,
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