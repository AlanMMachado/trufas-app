import { RemessaService } from '@/service/remessaService';
import { Remessa } from '@/types/Remessa';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const [remessas, setRemessas] = useState<Remessa[]>([]);

  useEffect(() => {
    loadRemessas();
  }, []);

  const loadRemessas = async () => {
    try {
      const data = await RemessaService.getAll();
      setRemessas(data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as remessas');
    }
  };

  const handleCreateRemessa = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await RemessaService.create({
         data: today,
         produtos: []
        });
      loadRemessas();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a remessa');
    }
  };

  const handleDeleteRemessa = (id: number) => {
    Alert.alert(
      'Confirmar',
      'Deseja excluir esta remessa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await RemessaService.delete(id);
            loadRemessas();
          }
        }
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Remessas</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleCreateRemessa}
        >
          <Text style={styles.addButtonText}>+ Nova Remessa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={remessas}
        keyExtractor={(item) => item.id!.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('RemessaDetail', { remessaId: item.id })}
            onLongPress={() => handleDeleteRemessa(item.id!)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Remessa {formatDate(item.data)}</Text>
              <Text style={styles.cardSubtitle}>Toque para ver detalhes</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nenhuma remessa cadastrada</Text>
            <Text style={styles.emptySubtext}>Toque em "Nova Remessa" para começar</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});