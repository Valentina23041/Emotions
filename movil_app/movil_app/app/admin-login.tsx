import { loginAdmin } from "@/services/emotionApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminLoginScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleLogin = async () => {
    try {
      setMensaje("");

      await loginAdmin(correo, contrasena);

      router.replace("/admin-dashboard");
    } catch (error: any) {
      setMensaje(
        error?.response?.data?.error ||
          "No se pudo iniciar sesión como administrador."
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Panel administrador</Text>

        <Text style={styles.subtitle}>
          Ingresa tus credenciales para visualizar los registros emocionales.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Correo administrador"
          placeholderTextColor="#777"
          value={correo}
          onChangeText={setCorreo}
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="#777"
          value={contrasena}
          onChangeText={setContrasena}
          secureTextEntry
        />

        {mensaje ? <Text style={styles.error}>{mensaje}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.link}>Volver al inicio de sesión</Text>
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
    padding: 24,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#263238",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#5B6770",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  input: {
    height: 54,
    borderWidth: 1.2,
    borderColor: "#D6DEE8",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
  },
  error: {
    color: "#C62828",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#2F80ED",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  link: {
    marginTop: 18,
    color: "#2F80ED",
    textAlign: "center",
    fontWeight: "700",
  },
});