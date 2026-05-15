import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TransformaPDF</Text>
      <Text style={styles.subtitle}>Converta imagens em PDF facilmente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e63946' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
});