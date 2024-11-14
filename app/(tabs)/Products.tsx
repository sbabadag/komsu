import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  ProductDetails: { product: Product };
};

interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const productsList = Object.keys(data).map((key) => {
            const product = data[key];

            // Normalize images to always be an array
            let images: string[] = [];
            if (product.images) {
              if (Array.isArray(product.images)) {
                images = product.images;
              } else if (typeof product.images === 'object') {
                // Firebase might store arrays as objects with numeric keys
                images = Object.values(product.images);
              } else if (typeof product.images === 'string') {
                images = [product.images];
              }
            }

            return {
              id: key,
              ...product,
              images,
            } as Product;
          });
          setProducts(productsList);
        } else {
          setProducts([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch data: ', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Text style={styles.productName}>{item.name}</Text>
      {item.images.length > 0 ? (
        <FlatList
          data={item.images}
          horizontal
          renderItem={({ item: imageUri }) => (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          )}
          keyExtractor={(imageUri, index) => index.toString()}
        />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
      <Text style={styles.productDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Products</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={3} // Set number of columns to 3
          columnWrapperStyle={styles.columnWrapper} // Add column wrapper style
        />
      ) : (
        <Text>No products available.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  productCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width / 3 - 12, // Adjust max width for 3 columns
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDescription: { marginTop: 8 },
  noImageText: { color: '#888', marginVertical: 10 },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 4,
    borderRadius: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensure columns are spaced evenly
  },
});

export default Products;
