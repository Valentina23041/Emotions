import { AppTheme } from "@/constants/appTheme";
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

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>¡Bienvenido!</Text>

          <Image
            source={require("../assets/images/logo.jpeg")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.description}>
            Este espacio está diseñado para ayudarte a comprender tus emociones
            y fortalecer tu bienestar emocional a través del análisis
            inteligente y el seguimiento personalizado.
          </Text>

          <View style={styles.securityBox}>
            <Text style={styles.securityText}>
              Tu información es confidencial, segura y será tratada con
              responsabilidad por parte de la universidad.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Empezar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  wrapper: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 26,
    alignItems: "center",
    ...AppTheme.shadow,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: AppTheme.colors.textPrimary,
    marginBottom: 18,
    textAlign: "center",
  },
  image: {
    width: 230,
    height: 230,
    marginBottom: 18,
  },
  description: {
    fontSize: 17,
    lineHeight: 28,
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 22,
  },
  securityBox: {
    width: "100%",
    backgroundColor: "#F5FAFF",
    borderWidth: 1,
    borderColor: "#D7E8F8",
    borderRadius: 16,
    padding: 14,
  },
  securityText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#35526B",
    textAlign: "center",
    fontWeight: "600",
  },
  button: {
    alignSelf: "center",
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primaryBorder,
    borderWidth: 1.5,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 15,
    paddingHorizontal: 36,
    minWidth: 180,
    ...AppTheme.shadow,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
});
