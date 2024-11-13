import React from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';

const products = [
    {
        id: '1',
        name: 'Product 1',
        description: 'Description for product 1',
        image: 'https://via.placeholder.com/150'
    },
    {
        id: '2',
        name: 'Product 2',
        description: 'Description for product 2',
        image: 'https://via.placeholder.com/150'
    },
    {
        id: '3',
        name: 'Product 3',
        description: 'Description for product 3',
        image: 'https://via.placeholder.com/150'
    }
];

interface ProductItemProps {
    name: string;
    description: string;
    image: string;
}

const ProductItem: React.FC<ProductItemProps> = ({ name, description, image }) => (
    <View style={styles.productItem}>
        <Image source={{ uri: image }} style={styles.productImage} />
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productDescription}>{description}</Text>
    </View>
);

const Products = () => {
    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProductItem
                        name={item.name}
                        description={item.description}
                        image={item.image}
                    />
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    productItem: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        alignItems: 'center'
    },
    productImage: {
        width: 150,
        height: 150,
        marginBottom: 8
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4
    },
    productDescription: {
        fontSize: 14,
        color: '#666'
    }
});

export default Products;