import { View, Text, StyleSheet } from 'react-native';

interface SummaryCardProps {
  title: string;
  value: string;
  color?: 'default' | 'green' | 'red';
}

export default function SummaryCard({ title, value, color = 'default' }: SummaryCardProps) {
  const valueColor =
    color === 'green' ? '#16A34A' :
    color === 'red' ? '#DC2626' :
    '#1A1A1A';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
