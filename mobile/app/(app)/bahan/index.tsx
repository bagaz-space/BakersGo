import { View, Text, StyleSheet } from 'react-native';

export default function BahanScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Master Bahan</Text>
      <Text style={styles.subtitle}>Segera hadir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F0E8' },
  title: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  subtitle: { fontSize: 14, color: '#6B6B6B', marginTop: 8 },
});
