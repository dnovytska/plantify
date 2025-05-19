import React, { useContext } from "react";
import { SafeAreaView, View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import HeaderDropdown from "../components/HeaderDropDown";
import BottomBar from "../components/BottomBar";

export default function ProfileScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderDropdown />

      <Image
        source={{ uri: "https://images.unsplash.com/photo-1507521628349-6d6f9b7b5b6e" }} // Imagem de fundo (paisagem)
        style={styles.backgroundImage}
      />

      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/RXQ247PXg9/fqz9itgj.png" }} // Avatar padrão
          style={styles.avatar}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.username}>{user?.name || "User Name"}</Text>
        <Text style={styles.email}>{user?.email || "Email"}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Name: {user?.name || "John Doe"}</Text>
        <Text style={styles.detailText}>Email: {user?.email || "johndoe@email.com"}</Text>
      </View>

      <BottomBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundImage: {
    width: "100%",
    height: "60%", // Ajuste para cobrir a maior parte da tela
    position: "absolute",
    top: 0,
    left: 0,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 60, // Ajuste para posicionar o avatar sobre a imagem de fundo
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#468585",
  },
  infoContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2F2182",
  },
  email: {
    fontSize: 16,
    color: "#468585",
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: "#E9E9F9",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 16,
    color: "#2F2182",
    fontWeight: "bold",
  },
  detailsContainer: {
    backgroundColor: "#E9E9F9",
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: "center",
  },
  detailText: {
    fontSize: 16,
    color: "#468585",
    marginBottom: 5,
  },
});