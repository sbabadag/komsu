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
  Platform,
  Modal,
} from 'react-native';
import { ref, onValue, set, get } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import ProductDetails from './ProductDetails';

type RootStackParamList = {
  ProductDetails: { product: Product };
};

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [savedProducts, setSavedProducts] = useState<{ [key: string]: boolean }>({});
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

    // Fetch saved products for the user
    const userId = 'user-id'; // Replace with actual user ID
    const savedProductsRef = ref(database, `savedProducts/${userId}`);
    get(savedProductsRef).then((snapshot) => {
      if (snapshot.exists()) {
        setSavedProducts(snapshot.val());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProduct = (product: Product) => {
    const userId = 'user-id'; // Replace with actual user ID
    const savedProductsRef = ref(database, `savedProducts/${userId}/${product.id}`);
    set(savedProductsRef, product)
      .then(() => {
        console.log('Product saved for later lookup');
        setSavedProducts((prev) => ({ ...prev, [product.id]: true }));
      })
      .catch((error) => {
        console.error('Failed to save product: ', error);
      });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => setSelectedProduct(item)}
    >
      <View style={styles.cardHeader}>
        <TouchableOpacity onPress={() => handleSaveProduct(item)}>
          <FontAwesome
            name={savedProducts[item.id] ? 'heart' : 'heart-o'}
            size={24}
            color="red"
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      {item.images.length > 0 ? (
        <FlatList
          data={item.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          renderItem={({ item: imageUri }) => (
            <Image source={{ uri: imageUri }} style={styles.productImage} />
          )}
          keyExtractor={(imageUri, index) => index.toString()}
        />
      ) : (
        <Text style={styles.noImageText}>No Image Available</Text>
      )}
      <Text style={styles.productDescription}>{item.description}</Text>
      <TouchableOpacity style={styles.bidButton} onPress={() => console.log('Bid button pressed')}>
        <Text style={styles.bidButtonText}>Bid</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const numColumns = Platform.OS === 'web' ? 6 : 2;

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
          numColumns={numColumns} // Set number of columns dynamically
          columnWrapperStyle={styles.columnWrapper} // Add column wrapper style
          contentContainerStyle={styles.flatListContent} // Add content container style
        />
      ) : (
        <Text>No products available.</Text>
      )}

      {selectedProduct && (
        <Modal
          visible={true}
          animationType="slide"
          onRequestClose={() => setSelectedProduct(null)}
        >
          <ProductDetails
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16, // Add more horizontal padding for web
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  productCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width / (Platform.OS === 'web' ? 6 : 2) - 24, // Adjust max width dynamically
    height: 250, // Increase the height of the card to make space for the button
    paddingBottom: 40, // Add padding to the bottom to make space for the button
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  productName: { fontSize: 16, fontWeight: 'bold' },
  productDescription: { marginTop: 8 },
  noImageText: { color: '#888', marginVertical: 10 },
  productImage: {
    width: Dimensions.get('window').width / (Platform.OS === 'web' ? 6 : 2) - 24, // Adjust width dynamically
    height: 200, // Set the height of the image
    borderRadius: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensure columns are spaced evenly
  },
  flatListContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 0, // Add more horizontal padding for web
  },
  bidButton: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#007bff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  bidButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Products;