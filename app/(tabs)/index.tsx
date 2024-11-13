import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../LoginScreen';
import TabsLayout from './_layout';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={TabsLayout} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

export default App;