import { iniciarChat, responderChat } from "@/services/emotionApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Mensaje = {
  id: string;
  tipo: "bot" | "usuario";
  texto: string;
};

export default function ChatbotScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [finalizado, setFinalizado] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    iniciarConversacion();
  }, []);

  const iniciarConversacion = async () => {
    try {
      setLoading(true);

      const userString = await AsyncStorage.getItem("user");

      if (!userString) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userString);
      setUserName(user.nombres || "");

      const response = await iniciarChat(user.idUsuario);

      setSessionId(response.session_id);
      setMensajes([
        {
          id: `m-${Date.now()}`,
          tipo: "bot",
          texto: response.respuesta,
        },
      ]);
    } catch (error) {
      console.error("Error al iniciar chat:", error);
      setMensajes([
        {
          id: `e-${Date.now()}`,
          tipo: "bot",
          texto: "No se pudo iniciar la conversación. Intenta nuevamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const enviarMensaje = async () => {
    if (!texto.trim() || !sessionId || enviando || finalizado) return;

    const textoUsuario = texto.trim();

    const nuevoMensajeUsuario: Mensaje = {
      id: `u-${Date.now()}`,
      tipo: "usuario",
      texto: textoUsuario,
    };

    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);
    setTexto("");

    try {
      setEnviando(true);

      const response = await responderChat(sessionId, textoUsuario);

      const nuevoMensajeBot: Mensaje = {
        id: `b-${Date.now()}`,
        tipo: "bot",
        texto: response.respuesta,
      };

      setMensajes((prev) => [...prev, nuevoMensajeBot]);

      if (response.finalizado) {
        setFinalizado(true);
      }
    } catch (error) {
      console.error("Error al responder chat:", error);

      setMensajes((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          tipo: "bot",
          texto: "Ocurrió un error al procesar tu mensaje. Intenta nuevamente.",
        },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const irADashboard = () => {
    router.replace("/dashboard");
  };

  const renderItem = ({ item }: { item: Mensaje }) => (
    <View
      style={[
        styles.messageRow,
        item.tipo === "usuario" ? styles.userRow : styles.botRow,
      ]}
    >
      {item.tipo === "bot" && (
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>🤖</Text>
        </View>
      )}

      <View
        style={[
          styles.messageBubble,
          item.tipo === "usuario" ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            item.tipo === "usuario" ? styles.userText : styles.botText,
          ]}
        >
          {item.texto}
        </Text>
      </View>

      {item.tipo === "usuario" && (
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>👤</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Iniciando conversación...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chat emocional</Text>
          <Text style={styles.headerSubtitle}>
            {userName
              ? `Hola, ${userName}. Estoy aquí para escucharte.`
              : "Estoy aquí para escucharte y orientarte."}
          </Text>
        </View>

        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {enviando && !finalizado ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>El bot está escribiendo...</Text>
          </View>
        ) : null}

        {finalizado ? (
          <View style={styles.footerFinalizado}>
            <TouchableOpacity
              style={styles.dashboardButton}
              onPress={irADashboard}
              activeOpacity={0.85}
            >
              <Text style={styles.dashboardButtonText}>Ver mi dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Escribe tu respuesta..."
              placeholderTextColor="#7B8794"
              value={texto}
              onChangeText={setTexto}
              editable={!enviando}
              multiline={false}
            />

            <TouchableOpacity
              style={[styles.sendButton, enviando && styles.sendButtonDisabled]}
              onPress={enviarMensaje}
              disabled={enviando}
              activeOpacity={0.85}
            >
              <Text style={styles.sendButtonText}>
                {enviando ? "..." : "Enviar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#EAF1F7",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#EAF1F7",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#5B6770",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    paddingTop: 22,
    paddingBottom: 18,
    paddingHorizontal: 20,
    backgroundColor: "#2F80ED",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#E8F1FF",
    marginTop: 6,
    lineHeight: 18,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 110,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  botRow: {
    justifyContent: "flex-start",
  },
  userRow: {
    justifyContent: "flex-end",
  },
  botAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCEBFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  botAvatarText: {
    fontSize: 16,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  userAvatarText: {
    fontSize: 16,
  },
  messageBubble: {
    maxWidth: "74%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  userBubble: {
    backgroundColor: "#2F80ED",
    borderTopRightRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  botText: {
    color: "#2D3748",
  },
  userText: {
    color: "#FFFFFF",
  },
  typingContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  typingText: {
    fontSize: 13,
    color: "#667085",
    fontStyle: "italic",
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    paddingHorizontal: 16,
    color: "#222",
    borderWidth: 1,
    borderColor: "#D6DEE8",
    fontSize: 15,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#2F80ED",
    borderRadius: 24,
    paddingHorizontal: 18,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#1E5FB8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  footerFinalizado: {
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  dashboardButton: {
    backgroundColor: "#2F80ED",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1.2,
    borderColor: "#1E5FB8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboardButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});
