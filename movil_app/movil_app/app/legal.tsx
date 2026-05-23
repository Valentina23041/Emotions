import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LegalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../assets/images/saludmental.png")}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>Protección y confidencialidad de datos</Text>

        <Text style={styles.text}>
          Tu información es confidencial y está protegida conforme a la Ley 1581
          de 2012 y el Decreto 1377 de 2013. Los datos registrados en la
          aplicación serán tratados de manera segura, responsable y únicamente
          con fines de orientación, análisis emocional y acompañamiento
          institucional.
        </Text>

        <Text style={styles.text}>
          La información no será compartida con terceros sin autorización. Su
          uso estará orientado al bienestar emocional del usuario, respetando los
          principios de privacidad, seguridad, confidencialidad y protección de
          datos personales.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.buttonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF1F7",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 430,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 26,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  image: {
    width: 170,
    height: 170,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#263238",
    textAlign: "center",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    color: "#4D5B66",
    textAlign: "center",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2F80ED",
    paddingVertical: 14,
    paddingHorizontal: 34,
    borderRadius: 14,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
});