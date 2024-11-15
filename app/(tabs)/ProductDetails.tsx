import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Product } from './Products';
import { FontAwesome } from '@expo/vector-icons';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onClose }) => {
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }[]>([]);

  useEffect(() => {
    const fetchImageDimensions = async () => {
      const dimensions = await Promise.all(
        product.images.map((imageUri) =>
          new Promise<{ width: number; height: number }>((resolve) => {
            Image.getSize(imageUri, (width, height) => {
              const screenWidth = Dimensions.get('window').width * 0.8; // Set max width to 80% of screen width
              const scaleFactor = width / screenWidth;
              const imageHeight = height / scaleFactor;
              resolve({ width: screenWidth, height: imageHeight });
            });
          })
        )
      );
      setImageDimensions(dimensions);
    };

    fetchImageDimensions();
  }, [product.images]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <FontAwesome name="arrow-left" size={24} color="black" />
      </TouchableOpacity>
      <ScrollView>
        <Text style={styles.title}>{product.name}</Text>
        {product.images.map((imageUri, index) => (
          <Image
            key={index}
            source={{ uri: imageUri }}
            style={[
              styles.image,
              {
                width: imageDimensions[index]?.width || '80%',
                height: imageDimensions[index]?.height || 200,
              },
            ]}
          />
        ))}
        <Text style={styles.description}>{product.description}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  image: {
    maxWidth: '80%', // Set max width to 80% of the container
    marginBottom: 16,
    borderRadius: 8,
    alignSelf: 'center', // Center the image horizontally
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
  },
});

export default ProductDetails;