import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Dimensions, TextInput, Button } from 'react-native';
import { ref, onValue } from 'firebase/database';
import { database } from '../../firebaseConfig';

interface Product {
    id: string;
    name: string;
    description: string;
    image: string;
}

const ProductItem: React.FC<Product> = ({ name, description, image }) => (
    <View style={styles.productItem}>
        <Image source={{ uri: image }} style={styles.productImage} />
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.productDescription}>{description}</Text>
    </View>
);

import { NavigationProp } from '@react-navigation/native';

const Products: React.FC<{ navigation: NavigationProp<any> }> = ({ navigation }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const productsRef = ref(database, 'products');
        const unsubscribe = onValue(productsRef, (snapshot) => {
            const data = snapshot.val();
            const productList = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
            setProducts(productList);
        });

        return () => unsubscribe();
    }, []);

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <Button title="Add New Product" onPress={() => navigation.navigate('newProduct')} />
            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProductItem
                        id={item.id}
                        name={item.name}
                        description={item.description}
                        image={item.image}
                    />
                )}
                numColumns={3}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
        backgroundColor: '#fff'
    },
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 16
    },
    productItem: {
        width: Dimensions.get('window').width / 3 - 16, // Subtracting margin
        margin: 8,
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        alignItems: 'center'
    },
    productImage: {
        width: Dimensions.get('window').width / 3 - 32,
        height: Dimensions.get('window').width / 3 - 32,
        marginBottom: 8
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center'
    },
    productDescription: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center'
    }
});

export default Products;