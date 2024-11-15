import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { ref, push, onValue, set, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const NewProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const productsRef = ref(database, `users/${userId}/products`);
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUserProducts(productsList);
      } else {
        setUserProducts([]);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAddProduct = async () => {
    if (!userId) {
      alert('User not logged in');
      return;
    }

    const newProduct = { name, description, images };
    try {
      await push(ref(database, `users/${userId}/products`), newProduct);
      console.log('Product added:', newProduct);
      setName('');
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handlePublishProduct = async (productId: string) => {
    if (!userId) return;

    try {
      const productRef = ref(database, `users/${userId}/products/${productId}`);
      const snapshot = await get(productRef);
      const productData = snapshot.val();

      if (productData) {
        // Add product to global products
        await push(ref(database, 'products'), productData);

        console.log('Product published:', productData);
        setPublishedProducts((prev) => ({ ...prev, [productId]: true }));
      }
    } catch (error) {
      console.error('Error publishing product:', error);
    }
  };

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImages = result.assets.map((asset) => asset.uri);
      setImages(selectedImages);
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <Text style={styles.productName}>{item.name}</Text>
      {item.images && item.images.length > 0 && (
        <FlatList
          data={item.images}
          horizontal
          renderItem={({ item: imageUri }: { item: string }) => (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          )}
          keyExtractor={(imageUri, index) => index.toString()}
        />
      )}
      <Text style={styles.productDescription}>{item.description}</Text>
      <TouchableOpacity
        style={[styles.publishButton, publishedProducts[item.id] && styles.disabledButton]}
        onPress={() => handlePublishProduct(item.id)}
        disabled={publishedProducts[item.id]}
      >
        <Text style={styles.publishButtonText}>
          {publishedProducts[item.id] ? 'Published' : 'Publish'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      <TextInput
        placeholder="Product Name"
        value={name}
        onChangeText={(text) => setName(text)}
        style={styles.input}
      />
      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
        style={styles.input}
      />
      <Button title="Pick Images" onPress={pickImages} />
      {images.length > 0 && (
        <FlatList
          data={images}
          horizontal
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.selectedImage} />
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
      <Button title="Add Product" onPress={handleAddProduct} />

      <Text style={styles.subtitle}>Your Products</Text>
      {userProducts.length > 0 ? (
        <FlatList
          data={userProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2} // Set number of columns for the grid
        />
      ) : (
        <Text>No products added yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 8 },
  selectedImage: { width: 100, height: 100, marginRight: 8 },
  productCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
    padding: 8,
    borderRadius: 8,
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDescription: { marginTop: 8 },
  productImage: { width: 100, height: 100, marginRight: 4, borderRadius: 8 },
  publishButton: {
    backgroundColor: '#28a745',
    padding: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  publishButtonText: { color: '#fff', fontWeight: 'bold' },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default NewProduct;
