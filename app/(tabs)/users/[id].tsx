import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams, router, usePathname } from "expo-router";




const UserPage = () => {

    const pathname = usePathname();
    const local = useLocalSearchParams();

    return (
        <View>
            <Text>The User Page {local.id}</Text>
        </View>
    );
};

export default UserPage;