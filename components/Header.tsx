import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Header({ title, subtitle, actions }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {actions && <View style={styles.actionsContainer}>{actions}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 35,
    paddingBottom: 20,
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'visible',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    fontFamily: 'Nunito_700Bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
    fontFamily: 'Nunito_400Regular',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
});