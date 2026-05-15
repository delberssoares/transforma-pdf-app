import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...uris]);
    }
  }

  function removeImage(uri: string) {
    setImages((prev) => prev.filter((img) => img !== uri));
  }

  async function generatePDF() {
    if (images.length === 0) return;
    setLoading(true);

    try {
      const imagesHtml = await Promise.all(
        images.map(async (uri) => {
          const base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          const ext = uri.split('.').pop()?.toLowerCase();
          const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
          return `<img src="data:${mime};base64,${base64}" style="width:100%; margin-bottom:16px;" />`;
        })
      );

      const html = `
        <html>
          <body style="margin:0; padding:16px;">
            ${imagesHtml.join('')}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      // Pede para o usuário escolher a pasta (Downloads, etc)
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (permissions.granted) {
        const base64PDF = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        const fileName = `TransformaPDF_${Date.now()}.pdf`;
        const newUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'application/pdf'
        );
        await FileSystem.writeAsStringAsync(newUri, base64PDF, { encoding: 'base64' });
        Alert.alert('Sucesso!', 'PDF salvo na pasta escolhida!');
      } else {
        // Se recusar a pasta, só compartilha
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar PDF',
          UTI: 'com.adobe.pdf',
        });
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TransformaPDF</Text>
      <Text style={styles.subtitle}>Converta imagens em PDF facilmente</Text>

      <Pressable style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>+ Selecionar Imagens</Text>
      </Pressable>

      {images.length > 0 && (
        <>
          <FlatList
            data={images}
            keyExtractor={(item) => item}
            numColumns={3}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} />
                <Pressable style={styles.remove} onPress={() => removeImage(item)}>
                  <Text style={styles.removeText}>✕</Text>
                </Pressable>
              </View>
            )}
          />

          <Pressable
            style={[styles.button, styles.buttonPDF, loading && styles.buttonDisabled]}
            onPress={generatePDF}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                Gerar PDF ({images.length} imagem{images.length > 1 ? 'ns' : ''})
              </Text>
            )}
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', paddingTop: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#e63946' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 8 },
  button: {
    marginTop: 32,
    backgroundColor: '#e63946',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  buttonPDF: {
    backgroundColor: '#2b9348',
    marginBottom: 32,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  grid: { marginTop: 24, paddingHorizontal: 8 },
  imageWrapper: { margin: 4, position: 'relative' },
  image: { width: 100, height: 100, borderRadius: 8 },
  remove: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});