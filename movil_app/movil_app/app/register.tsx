import { AppTheme } from "@/constants/appTheme";
import { registerUser } from "@/services/emotionApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  const router = useRouter();

  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [aceptaPoliticas, setAceptaPoliticas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error" | "">("");

  const handleRegister = async () => {
    if (!nombres || !apellidos || !correo || !contrasena) {
      setTipoMensaje("error");
      setMensaje("Por favor completa todos los campos.");
      return;
    }

    if (!aceptaPoliticas) {
      setTipoMensaje("error");
      setMensaje("Debes aceptar las políticas.");
      return;
    }

    try {
      setLoading(true);
      setMensaje("");
      setTipoMensaje("");

      const response = await registerUser({
        nombres,
        apellidos,
        correo,
        contrasena,
        aceptaPoliticas,
      });

      console.log("Registro exitoso:", response);

      setTipoMensaje("success");
      setMensaje("Tu cuenta fue creada correctamente.");

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } catch (error: any) {
      console.log("Error backend:", error?.response?.data);

      const mensajeError =
        error?.response?.data?.error ||
        "Ocurrió un error al registrar el usuario.";

      setTipoMensaje("error");
      setMensaje(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>¡Únete a Connecting Emotions!</Text>
          <Text style={styles.subtitle}>
            Crea tu cuenta para comenzar tu proceso de bienestar emocional.
          </Text>

          <Image
            source={require("../assets/images/register.jpeg")}
            style={styles.avatar}
            resizeMode="contain"
          />

          <TextInput
            style={styles.input}
            placeholder="Nombres"
            placeholderTextColor="#7B8794"
            value={nombres}
            onChangeText={setNombres}
          />

          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            placeholderTextColor="#7B8794"
            value={apellidos}
            onChangeText={setApellidos}
          />

          <TextInput
            style={styles.input}
            placeholder="Correo"
            placeholderTextColor="#7B8794"
            keyboardType="email-address"
            autoCapitalize="none"
            value={correo}
            onChangeText={setCorreo}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#7B8794"
            secureTextEntry
            value={contrasena}
            onChangeText={setContrasena}
          />

          <Pressable
            style={styles.checkboxRow}
            onPress={() => setAceptaPoliticas(!aceptaPoliticas)}
          >
            <View
              style={[
                styles.checkbox,
                aceptaPoliticas && styles.checkboxChecked,
              ]}
            >
              {aceptaPoliticas && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              Acepto las políticas y el registro de esta aplicación
            </Text>
          </Pressable>

          {mensaje ? (
            <View
              style={[
                styles.messageBox,
                tipoMensaje === "success" ? styles.successBox : styles.errorBox,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  tipoMensaje === "success"
                    ? styles.successText
                    : styles.errorText,
                ]}
              >
                {mensaje}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrarse</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.linkText}>
              ¿Ya tienes cuenta? Inicia sesión
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 24,
    ...AppTheme.shadow,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: AppTheme.colors.textPrimary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  avatar: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginBottom: 18,
  },
  input: {
    width: "100%",
    height: 54,
    backgroundColor: AppTheme.colors.inputBg,
    borderWidth: 1.2,
    borderColor: AppTheme.colors.inputBorder,
    borderRadius: AppTheme.radius.md,
    paddingHorizontal: 16,
    marginBottom: 14,
    fontSize: 16,
    color: AppTheme.colors.textPrimary,
  },
  checkboxRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.4,
    borderColor: "#8A97A5",
    borderRadius: 4,
    backgroundColor: "#FFF",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primary,
  },
  checkmark: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: AppTheme.colors.textSecondary,
    lineHeight: 20,
  },
  messageBox: {
    width: "100%",
    padding: 12,
    borderRadius: AppTheme.radius.sm,
    marginBottom: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 20,
  },
  successBox: {
    backgroundColor: AppTheme.colors.successBg,
    borderColor: AppTheme.colors.successBorder,
  },
  errorBox: {
    backgroundColor: AppTheme.colors.errorBg,
    borderColor: AppTheme.colors.errorBorder,
  },
  successText: {
    color: AppTheme.colors.successText,
  },
  errorText: {
    color: AppTheme.colors.errorText,
  },
  button: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primaryBorder,
    borderWidth: 1.5,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 170,
    ...AppTheme.shadow,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  linkButton: {
    marginTop: 18,
  },
  linkText: {
    color: AppTheme.colors.link,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
});
