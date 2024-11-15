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
  TextInput,
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
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    const productsRef = ref(database, 'products');

    onValue(
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

          // Filter products based on search query
          const filteredProducts = productsList.filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase())
          );

          setProducts(filteredProducts);
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
  };

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

  const handleBidAmountChange = (productId: string, amount: string) => {
    setBidAmounts((prev) => ({ ...prev, [productId]: amount }));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    fetchProducts();
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <TouchableOpacity onPress={() => setSelectedProduct(item)}>
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
      </TouchableOpacity>
      <View style={styles.bidContainer}>
        <TextInput
          style={styles.bidInput}
          placeholder="Enter bid amount"
          keyboardType="numeric"
          value={bidAmounts[item.id] || ''}
          onChangeText={(text) => handleBidAmountChange(item.id, text)}
        />
        <TouchableOpacity style={styles.bidButton} onPress={() => console.log('Bid button pressed')}>
          <Text style={styles.bidButtonText}>Bid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const numColumns = Platform.OS === 'web' ? 6 : 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Products</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
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
    backgroundColor: '#F4F4F4', // RAL 9003 color
    flex: 1,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 16, // Add more horizontal padding for web
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  productCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
    padding: 8,
    borderRadius: 8,
    maxWidth: Dimensions.get('window').width / (Platform.OS === 'web' ? 6 : 2) - 24, // Adjust max width dynamically
    height: 300, // Increase the height of the card to make space for the button
    justifyContent: 'space-between', // Ensure content is spaced evenly
    backgroundColor: '#fff', // Ensure background color is white for shadow visibility
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
    elevation: 5, // Elevation for Android
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
    height: 150, // Set the height of the image
    borderRadius: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between', // Ensure columns are spaced evenly
  },
  flatListContent: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 0, // Add more horizontal padding for web
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  bidInput: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    marginRight: 10,
  },
  bidButton: {
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