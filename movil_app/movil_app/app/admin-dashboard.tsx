import { getAdminSesiones } from "@/services/emotionApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Registro = {
  sessionId: string;
  estadoSesion: string;
  emocionDetectada: string;
  confianza: number;
  nivelRiesgo: string;
  estadoGeneral: string;
  requiereSeguimiento: boolean;
  fechaCreacion: string;
};

type UsuarioAdmin = {
  idUsuario: string;
  correo: string;
  nombres: string;
  registros: Registro[];
};

/* ── Helpers de color semántico ── */
const estadoColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  alerta:    { bg: "#FCEBEB", text: "#791F1F", dot: "#A32D2D", border: "#A32D2D" },
  estable:   { bg: "#FAEEDA", text: "#633806", dot: "#854F0B", border: "#C4782A" },
  favorable: { bg: "#EAF3DE", text: "#27500A", dot: "#3B6D11", border: "#5A9E4A" },
};
const riesgoColors: Record<string, { bg: string; text: string }> = {
  alto:  { bg: "#FCEBEB", text: "#791F1F" },
  medio: { bg: "#FAEEDA", text: "#633806" },
  bajo:  { bg: "#EAF3DE", text: "#27500A" },
};
const emocionColors: Record<string, string> = {
  Tristeza: "#4A7FC1",
  Alegría:  "#5A9E4A",
  Miedo:    "#C4782A",
  Ira:      "#A83240",
  Neutral:  "#888780",
};

const getEstadoStyle  = (e: string) => estadoColors[e?.toLowerCase()]  ?? { bg: "#F1EFE8", text: "#444441", dot: "#888780", border: "#888780" };
const getRiesgoStyle  = (r: string) => riesgoColors[r?.toLowerCase()]  ?? { bg: "#F1EFE8", text: "#444441" };
const getEmocionColor = (em: string) => emocionColors[em] ?? "#888780";

const formatFecha = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-CO", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const Initials = ({ name }: { name: string }) => {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

const Chip = ({ label, bg, text }: { label: string; bg: string; text: string }) => (
  <View style={[styles.chip, { backgroundColor: bg }]}>
    <Text style={[styles.chipText, { color: text }]}>{label}</Text>
  </View>
);

const ProgressBar = ({ value }: { value: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${Math.min(value * 100, 100)}%` as any }]} />
  </View>
);

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { cargarUsuarios(); }, []);

  const cargarUsuarios = async () => {
    try {
      const data = await getAdminSesiones();
      setUsuarios(data.usuarios || []);
    } catch (error) {
      console.error("Error cargando usuarios admin:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderRegistro = (registro: Registro, index: number) => {
    const estadoStyle  = getEstadoStyle(registro.estadoGeneral);
    const riesgoStyle  = getRiesgoStyle(registro.nivelRiesgo);
    const emocionColor = getEmocionColor(registro.emocionDetectada);
    const pct          = registro.confianza ? registro.confianza * 100 : 0;

    return (
      <View
        key={registro.sessionId}
        style={[styles.registerBox, { borderLeftColor: estadoStyle.border }]}
      >
        {/* Título + badge estado */}
        <View style={styles.registerHeader}>
          <Text style={styles.registerTitle}>Registro #{index + 1}</Text>
          <Chip
            label={registro.estadoGeneral}
            bg={estadoStyle.bg}
            text={estadoStyle.text}
          />
        </View>

        {/* Emoción */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Emoción detectada</Text>
          <View style={styles.fieldRight}>
            <View style={[styles.emocionDot, { backgroundColor: emocionColor }]} />
            <Text style={[styles.fieldValue, { color: emocionColor, fontWeight: "600" }]}>
              {registro.emocionDetectada}
            </Text>
          </View>
        </View>

        {/* Confianza */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Confianza</Text>
          <Text style={styles.fieldValue}>
            {registro.confianza ? `${pct.toFixed(2)}%` : "N/A"}
          </Text>
        </View>
        <ProgressBar value={registro.confianza ?? 0} />

        {/* Nivel riesgo */}
        <View style={[styles.fieldRow, { marginTop: 8 }]}>
          <Text style={styles.fieldLabel}>Nivel de riesgo</Text>
          <Chip
            label={registro.nivelRiesgo}
            bg={riesgoStyle.bg}
            text={riesgoStyle.text}
          />
        </View>

        {/* Sesión */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Sesión</Text>
          <Text style={styles.fieldValue}>{registro.estadoSesion}</Text>
        </View>

        {/* Seguimiento */}
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>Seguimiento</Text>
          <Chip
            label={registro.requiereSeguimiento ? "Sí requiere" : "No requiere"}
            bg={registro.requiereSeguimiento ? "#FCEBEB" : "#EAF3DE"}
            text={registro.requiereSeguimiento ? "#791F1F" : "#27500A"}
          />
        </View>

        {/* Fecha */}
        <View style={styles.dateLine}>
          <View style={styles.dateIcon}>
            <Text style={styles.dateIconText}>⏱</Text>
          </View>
          <Text style={styles.dateText}>{formatFecha(registro.fechaCreacion)}</Text>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UsuarioAdmin }) => (
    <View style={styles.card}>
      {/* Cabecera usuario */}
      <View style={styles.userHeader}>
        <Initials name={item.nombres} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.nombres}</Text>
          <Text style={styles.userEmail}>{item.correo}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {item.registros.length} {item.registros.length === 1 ? "registro" : "registros"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {item.registros.map((registro, index) => renderRegistro(registro, index))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={styles.loadingText}>Cargando registros...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.instLabel}>Sistema de análisis emocional · Tesis de grado</Text>
        <Text style={styles.title}>Panel administrador</Text>
        <Text style={styles.subtitle}>
          Registros de sesiones emocionales por participante
        </Text>
        <View style={styles.headerMeta}>
          <View style={styles.headerDot} />
          <Text style={styles.headerMetaText}>
            {usuarios.length} {usuarios.length === 1 ? "participante" : "participantes"} registrados
          </Text>
        </View>
      </View>

      {/* ── LISTA ── */}
      <FlatList
        data={usuarios}
        keyExtractor={(item) => item.idUsuario}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay usuarios con registros disponibles.</Text>
        }
      />

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          Sistema de análisis emocional v1.0
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => router.replace("/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ── BASE ── */
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  center: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#4D5B66",
    fontSize: 15,
  },

  /* ── HEADER ── */
  header: {
    backgroundColor: "#0C3D6B",
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 20,
  },
  instLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7BAFD4",
    fontWeight: "600",
    marginBottom: 6,
  },
  title: {
    color: "#E8F1FA",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  subtitle: {
    color: "#7BAFD4",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAEEF",
  },
  headerMetaText: {
    fontSize: 12,
    color: "#B4D2EC",
    fontWeight: "500",
  },

  /* ── LISTA ── */
  list: {
    padding: 14,
    paddingBottom: 100,
  },
  empty: {
    textAlign: "center",
    color: "#7B8794",
    marginTop: 48,
    fontSize: 14,
  },

  /* ── CARD USUARIO ── */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#D6E3EF",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E6F1FB",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0C447C",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A2733",
    textTransform: "capitalize",
  },
  userEmail: {
    fontSize: 12,
    color: "#185FA5",
    marginTop: 2,
  },
  countBadge: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#F0F4F8",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: {
    fontSize: 11,
    color: "#4D5B66",
    fontWeight: "500",
  },
  divider: {
    height: 0.5,
    backgroundColor: "#D6E3EF",
    marginBottom: 10,
  },

  /* ── REGISTRO ── */
  registerBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 0.5,
    borderColor: "#D6E3EF",
    borderLeftWidth: 3,
  },
  registerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  registerTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A2733",
    letterSpacing: 0.2,
  },

  /* ── CAMPOS ── */
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 12,
    color: "#6B7A88",
    flex: 1,
  },
  fieldRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1A2733",
    textTransform: "capitalize",
  },
  emocionDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  /* ── PROGRESS BAR ── */
  progressTrack: {
    height: 4,
    backgroundColor: "#E1EAF3",
    borderRadius: 2,
    marginBottom: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#185FA5",
    borderRadius: 2,
  },

  /* ── CHIPS ── */
  chip: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },

  /* ── FECHA ── */
  dateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#D6E3EF",
  },
  dateIcon: {
    opacity: 0.5,
  },
  dateIconText: {
    fontSize: 10,
  },
  dateText: {
    fontSize: 11,
    color: "#9AA7B3",
    letterSpacing: 0.2,
  },

  /* ── FOOTER ── */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0.5,
    borderTopColor: "#D6E3EF",
  },
  footerNote: {
    fontSize: 10,
    color: "#9AA7B3",
    letterSpacing: 0.4,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: "#0C3D6B",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  logoutText: {
    color: "#E8F1FA",
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
