import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function HomeScreen() {
  const [images, setImages] = useState<string[]>([]);

  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TransformaPDF</Text>
      <Text style={styles.subtitle}>Converta imagens em PDF facilmente</Text>

      <Pressable style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>+ Selecionar Imagens</Text>
      </Pressable>

      {images.length > 0 && (
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