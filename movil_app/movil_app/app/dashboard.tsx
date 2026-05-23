import { getUserStatistics } from "@/services/emotionApi";
import type { StatisticsResponse } from "@/types/emotion.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const colorMap: Record<string, string> = {
  Tristeza: "#4A7FC1",
  Alegría: "#5A9E4A",
  Miedo: "#C4782A",
  Ira: "#A83240",
  Neutral: "#888780",
};

export default function DashboardScreen() {
  const router = useRouter();

  const [stats, setStats] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUserAndStatistics();
  }, []);

  const loadUserAndStatistics = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        setLoading(false);
        return;
      }
      const user = JSON.parse(userString);
      setUserName(user.nombres || "");
      const data = await getUserStatistics(user.idUsuario);
      setStats(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = useMemo(() => {
    if (!stats?.distribucionEmociones) return [];
    return Object.entries(stats.distribucionEmociones).map(([emotion, value]) => ({
      name: emotion,
      population: value,
      color: colorMap[emotion] || "#888780",
      legendFontColor: "#4D5B66",
      legendFontSize: 12,
    }));
  }, [stats]);

  const lineData = useMemo(() => {
    if (!stats?.tendencia7Dias) {
      return { labels: [], datasets: [{ data: [] }] };
    }
    return {
      labels: stats.tendencia7Dias.map((item) => item.dia),
      datasets: [{ data: stats.tendencia7Dias.map((item) => item.valor) }],
    };
  }, [stats]);

  const resumenTexto = useMemo(() => {
    if (!stats) return "";
    if (stats.estadoGeneral === "alerta") {
      return "Se observa una tendencia que merece atención clínica. Se recomienda continuar el registro sistemático de emociones y considerar acompañamiento psicológico especializado si los indicadores persisten.";
    }
    if (stats.estadoGeneral === "estable") {
      return "La evolución emocional registrada muestra cierta estabilidad. Se sugiere mantener el seguimiento continuo y prestar atención a las variaciones en el patrón emocional.";
    }
    if (stats.estadoGeneral === "favorable") {
      return "Los indicadores emocionales reflejan un estado general favorable. Se recomienda fortalecer los hábitos de autocuidado y continuar con el registro emocional sistemático.";
    }
    return "No se cuenta con datos suficientes para generar una interpretación clínica en este momento.";
  }, [stats]);

  const estadoBadgeColor: Record<string, { bg: string; text: string; dot: string }> = {
    alerta:    { bg: "#FCEBEB", text: "#791F1F", dot: "#A32D2D" },
    estable:   { bg: "#FAEEDA", text: "#633806", dot: "#854F0B" },
    favorable: { bg: "#EAF3DE", text: "#27500A", dot: "#3B6D11" },
  };
  const badgeColors = estadoBadgeColor[stats?.estadoGeneral ?? ""] ?? {
    bg: "#F1EFE8", text: "#444441", dot: "#888780",
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#185FA5" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No se pudieron cargar las estadísticas.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── ENCABEZADO INSTITUCIONAL ── */}
      <View style={styles.headerCard}>
        <Text style={styles.instLabel}>Sistema de análisis emocional · Tesis de grado</Text>
        <Text style={styles.title}>Evolución emocional del paciente</Text>
        <Text style={styles.subtitle}>
          Panel de resultados estadísticos · Período de evaluación: 7 días
        </Text>
        {userName ? (
          <View style={styles.userTag}>
            <View style={styles.userDot} />
            <Text style={styles.userTagText}>Participante: {userName}</Text>
          </View>
        ) : null}
      </View>

      {/* ── MÉTRICAS RESUMEN ── */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.metricAccent, { backgroundColor: "#4A7FC1" }]} />
          <Text style={styles.metricValue} numberOfLines={1}>
            {stats.emocionDominante ?? "N/A"}
          </Text>
          <Text style={styles.metricPct}>{stats.porcentajeDominante}%</Text>
          <Text style={styles.metricLabel}>Emoción dominante</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricAccent, { backgroundColor: badgeColors.dot }]} />
          <Text style={[styles.metricValue, { color: badgeColors.text, textTransform: "capitalize" }]}>
            {stats.estadoGeneral}
          </Text>
          <Text style={styles.metricLabel}>Estado general</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricAccent, { backgroundColor: "#3B6D11" }]} />
          <Text style={styles.metricValue}>{stats.totalRegistros}</Text>
          <Text style={styles.metricLabel}>Registros totales</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricAccent, { backgroundColor: "#854F0B" }]} />
          <Text style={styles.metricValue}>
            {stats.riesgoAltoPorcentaje}
            <Text style={styles.metricUnit}>%</Text>
          </Text>
          <Text style={styles.metricLabel}>Índice de riesgo alto</Text>
        </View>
      </View>

      {/* ── DISTRIBUCIÓN PIE ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribución de emociones registradas</Text>
          <Text style={styles.sectionBadge}>n = {stats.totalRegistros}</Text>
        </View>
        {pieData.length > 0 ? (
          <>
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={190}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="6"
              absolute
              chartConfig={{ color: () => "#263238" }}
            />
            <View style={styles.divider} />
            <Text style={styles.sectionNote}>
              Emoción con mayor frecuencia:{" "}
              <Text style={styles.noteEmphasis}>{stats.emocionDominante}</Text>{" "}
              ({stats.porcentajeDominante}% del total de registros).
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>Sin datos disponibles para este período.</Text>
        )}
      </View>

      {/* ── TENDENCIA 7 DÍAS ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tendencia de bienestar — últimos 7 días</Text>
        </View>
        <LineChart
          data={lineData}
          width={screenWidth - 64}
          height={200}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#FFFFFF",
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(24, 95, 165, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(77, 91, 102, ${opacity})`,
            propsForBackgroundLines: {
              strokeDasharray: "4 4",
              stroke: "#E1EAF3",
              strokeWidth: 1,
            },
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#185FA5",
              fill: "#FFFFFF",
            },
          }}
          bezier
          style={styles.chart}
          withShadow={false}
        />
      </View>

      {/* ── INTERPRETACIÓN CLÍNICA ── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Interpretación clínica</Text>
          <View style={[styles.estadoBadge, { backgroundColor: badgeColors.bg }]}>
            <View style={[styles.estadoDot, { backgroundColor: badgeColors.dot }]} />
            <Text style={[styles.estadoText, { color: badgeColors.text }]}>
              {stats.estadoGeneral}
            </Text>
          </View>
        </View>
        <View style={styles.interpBorder}>
          <Text style={styles.interpText}>{resumenTexto}</Text>
        </View>
      </View>

      {/* ── BOTÓN FINALIZAR ── */}
      <TouchableOpacity
        style={styles.finalButton}
        onPress={() => router.push("/legal")}
        activeOpacity={0.85}
      >
        <Text style={styles.finalButtonText}>Finalizar sesión</Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        Datos generados automáticamente · Sistema de análisis emocional v1.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* ── LAYOUT BASE ── */
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  content: {
    padding: 16,
    paddingBottom: 48,
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

  /* ── ENCABEZADO ── */
  headerCard: {
    backgroundColor: "#0C3D6B",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#E8F1FA",
    marginBottom: 4,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    color: "#7BAFD4",
    lineHeight: 19,
  },
  userTag: {
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
  userDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4CAEEF",
  },
  userTagText: {
    fontSize: 12,
    color: "#B4D2EC",
    fontWeight: "500",
  },

  /* ── MÉTRICAS ── */
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 0.5,
    borderColor: "#D6E3EF",
    minHeight: 110,
  },
  metricAccent: {
    width: 20,
    height: 2.5,
    borderRadius: 2,
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A2733",
    textTransform: "capitalize",
    lineHeight: 24,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "400",
    color: "#6B7A88",
  },
  metricPct: {
    fontSize: 14,
    fontWeight: "600",
    color: "#185FA5",
    marginTop: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: "#6B7A88",
    marginTop: 4,
    letterSpacing: 0.3,
  },

  /* ── SECCIONES ── */
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: "#D6E3EF",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1A2733",
    flex: 1,
    letterSpacing: 0.2,
  },
  sectionBadge: {
    fontSize: 11,
    color: "#6B7A88",
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#D6E3EF",
    marginVertical: 10,
  },
  sectionNote: {
    fontSize: 13,
    color: "#4D5B66",
    textAlign: "center",
    lineHeight: 20,
  },
  noteEmphasis: {
    fontWeight: "600",
    color: "#185FA5",
  },
  emptyText: {
    color: "#7B8794",
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 16,
  },
  chart: {
    borderRadius: 12,
    marginLeft: -8,
  },

  /* ── INTERPRETACIÓN ── */
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  estadoDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  estadoText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
    letterSpacing: 0.2,
  },
  interpBorder: {
    borderLeftWidth: 2,
    borderLeftColor: "#185FA5",
    paddingLeft: 12,
    borderRadius: 2,
  },
  interpText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#4D5B66",
  },

  /* ── FOOTER ── */
  finalButton: {
    backgroundColor: "#0C3D6B",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 14,
  },
  finalButtonText: {
    color: "#E8F1FA",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  footerNote: {
    fontSize: 10,
    color: "#9AA7B3",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
