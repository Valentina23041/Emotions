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

export default function IntroChatScreen() {
  const router = useRouter();

  const handleContinuar = () => {
    router.replace("/chatbot");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Image
            source={require("../assets/images/saludmental.jpg")}
            style={styles.image}
            resizeMode="contain"
          />

          <Text style={styles.title}>Bienvenid@ a tu Diario Emocional</Text>

          <Text style={styles.description}>
            Este es un espacio seguro donde podrás expresar tus emociones con
            libertad y confianza. Aquí podrás registrar lo que sientes y recibir
            orientación para comprender mejor lo que estás viviendo.
          </Text>

          <View style={styles.securityBox}>
            <Text style={styles.securityTitle}>
              Privacidad y confidencialidad
            </Text>
            <Text style={styles.securityText}>
              Tu información será tratada de manera confidencial, segura y
              responsable por parte de la universidad. No será compartida con
              terceros y será utilizada únicamente con fines de acompañamiento y
              bienestar emocional.
            </Text>
          </View>

          <Text style={styles.footerText}>
            Comencemos este proceso de autoconocimiento y bienestar emocional.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleContinuar}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Continuar</Text>
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
    paddingTop: 28,
    paddingBottom: 28,
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    ...AppTheme.shadow,
  },
  image: {
    width: "100%",
    height: 180,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 18,
  },
  description: {
    fontSize: 16,
    lineHeight: 26,
    color: AppTheme.colors.textSecondary,
    textAlign: "left",
    marginBottom: 18,
  },
  securityBox: {
    backgroundColor: "#F5FAFF",
    borderWidth: 1,
    borderColor: "#D7E8F8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
  },
  securityTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: AppTheme.colors.primary,
    marginBottom: 8,
  },
  securityText: {
    fontSize: 14,
    lineHeight: 23,
    color: "#4D5B66",
  },
  footerText: {
    fontSize: 15,
    lineHeight: 24,
    color: AppTheme.colors.textPrimary,
    fontWeight: "700",
    textAlign: "left",
  },
  button: {
    alignSelf: "center",
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primaryBorder,
    borderWidth: 1.5,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 15,
    paddingHorizontal: 34,
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
