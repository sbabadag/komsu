import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, push, onValue, set } from 'firebase/database';
import { database } from '../../firebaseConfig';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { firebaseapp } from '../../firebaseConfig'; // Adjust the import path as necessary
import { getAuth } from 'firebase/auth';

// Initialize Firebase Auth with AsyncStorage persistence
const auth = getAuth(firebaseapp);

const NewProduct = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [publishedProducts, setPublishedProducts] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
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
      }
    });

    return () => unsubscribe();
  }, [userId]);

  const handleAddImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const handleSaveProduct = () => {
    if (!userId) return;

    const newProductRef = push(ref(database, `users/${userId}/products`));
    set(newProductRef, {
      name,
      description,
      images,
    }).then(() => {
      console.log('Product saved successfully');
      navigation.goBack();
    }).catch((error) => {
      console.error('Failed to save product: ', error);
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Product Description"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Add Image" onPress={handleAddImage} />
      <FlatList
        data={images}
        horizontal
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.image} />
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Save Product" onPress={handleSaveProduct} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 8,
  },
});

export default NewProduct;
