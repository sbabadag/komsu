import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, router } from 'expo-router';

const HomePage = () => {
    return (
        <View>
            <Text>User Page</Text>
            <Link href="/users/1"> Go to user 1</Link>
            <Pressable onPress={() => router.push("/users/2")}>
                <Text>Press me</Text>
            </Pressable>
        </View>
    );
};

export default HomePage;