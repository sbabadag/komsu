import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../../firebaseConfig';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  BidPage: { product: Product };
};

type BidPageRouteProp = RouteProp<RootStackParamList, 'BidPage'>;

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
}

const BidPage = () => {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<BidPageRouteProp>();
  const { product } = route.params;
  const userId = 'user-id'; // Replace with actual user ID

  useEffect(() => {
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

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmitBid = () => {
    const bidRef = ref(database, `products/${product.id}/bids/${userId}`);
    set(bidRef, selectedProducts)
      .then(() => {
        console.log('Bid submitted successfully');
        navigation.goBack();
      })
      .catch((error) => {
        console.error('Failed to submit bid: ', error);
      });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={[
        styles.productCard,
        selectedProducts.includes(item.id) && styles.selectedProductCard,
      ]}
      onPress={() => handleSelectProduct(item.id)}
    >
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftPane}>
        <Text style={styles.title}>Bidded Product</Text>
        <View style={styles.productCard}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.images.length > 0 ? (
            <FlatList
              data={product.images}
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
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>
      </View>
      <View style={styles.rightPane}>
        <Text style={styles.title}>My Products</Text>
        <FlatList
          data={userProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
        />
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmitBid}>
          <Text style={styles.submitButtonText}>Submit Bid</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  leftPane: {
    flex: 1,
    paddingRight: 8,
  },
  rightPane: {
    flex: 1,
    paddingLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  productCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    margin: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedProductCard: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDescription: {
    marginTop: 8,
  },
  noImageText: {
    color: '#888',
    marginVertical: 10,
  },
  productImage: {
    width: Dimensions.get('window').width / 3 - 24,
    height: 150,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BidPage;