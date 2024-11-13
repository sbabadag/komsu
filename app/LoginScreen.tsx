import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button, Image, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Ensure this file uses Firebase Web SDK

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  // Configure Google sign-in with platform-specific client IDs
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "817455873090-vj8qgftod0msnuo65l7v0d4pp2fiia3c.apps.googleusercontent.com",
    iosClientId: "817455873090-4fa79a7qg72nu5tbstivn9li6gg5okhl.apps.googleusercontent.com",
    webClientId: "817455873090-7321qin1jnaou6rmu4a6dfktprioirnr.apps.googleusercontent.com",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  // Handle response and fetch user info
  async function handleEffect() {
    const user = await getLocalUser();
    if (!user) {
      if (response?.type === "success") {
        getUserInfo(response.authentication?.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("Loaded user info from local storage");
    }
  }

  // Retrieve user info from local storage
  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  // Fetch user info from Google API and store in AsyncStorage
  const getUserInfo = async (accessToken: string | undefined) => {
    if (!accessToken) return;
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);

      // Optional: Use Firebase Auth with Google credential
      const auth = getAuth();
      const googleCredential = GoogleAuthProvider.credential(null, accessToken);
      signInWithCredential(auth, googleCredential)
          .catch(error => Alert.alert("Firebase Auth Error", error.message));
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      Alert.alert("Error", "Could not fetch user information.");
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <Button
          title="Sign in with Google"
          disabled={!request}
          onPress={() => promptAsync()}
        />
      ) : (
        <View style={styles.card}>
          {userInfo.picture && (
            <Image source={{ uri: userInfo.picture }} style={styles.image} />
          )}
          <Text style={styles.text}>Email: {userInfo.email}</Text>
          <Text style={styles.text}>Verified: {userInfo.verified_email ? "yes" : "no"}</Text>
          <Text style={styles.text}>Name: {userInfo.name}</Text>
        </View>
      )}
      <Button
        title="Remove Local Storage"
        onPress={async () => {
          await AsyncStorage.removeItem("@user");
          setUserInfo(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
});

export default LoginScreen;
