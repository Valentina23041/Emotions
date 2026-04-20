import { getUserStatistics } from "@/services/emotionApi";
import type { StatisticsResponse } from "@/types/emotion.types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const colorMap: Record<string, string> = {
  Tristeza: "#4A90E2",
  Alegría: "#7ED321",
  Miedo: "#F5A623",
  Ira: "#D0021B",
  Neutral: "#9B9B9B",
};

export default function DashboardScreen() {
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

    return Object.entries(stats.distribucionEmociones).map(
      ([emotion, value]) => ({
        name: emotion,
        population: value,
        color: colorMap[emotion] || "#999999",
        legendFontColor: "#333",
        legendFontSize: 13,
      }),
    );
  }, [stats]);

  const lineData = useMemo(() => {
    if (!stats?.tendencia7Dias) {
      return {
        labels: [],
        datasets: [{ data: [] }],
      };
    }

    return {
      labels: stats.tendencia7Dias.map((item) => item.dia),
      datasets: [
        {
          data: stats.tendencia7Dias.map((item) => item.valor),
        },
      ],
    };
  }, [stats]);

  const resumenTexto = useMemo(() => {
    if (!stats) return "";

    if (stats.estadoGeneral === "alerta") {
      return "Se observa una tendencia que merece atención. Te recomendamos continuar registrando tus emociones y buscar acompañamiento si lo necesitas.";
    }

    if (stats.estadoGeneral === "estable") {
      return "Tu evolución emocional muestra cierta estabilidad, aunque aparecen emociones que conviene seguir observando con cuidado.";
    }

    if (stats.estadoGeneral === "favorable") {
      return "Tu evolución emocional refleja un estado general favorable. Sigue fortaleciendo hábitos de autocuidado y registro emocional.";
    }

    return "Aún no hay suficientes datos para generar una interpretación.";
  }, [stats]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>
          No se pudieron cargar las estadísticas.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Mi evolución emocional</Text>
        <Text style={styles.subtitle}>
          {userName
            ? `Hola, ${userName}. Aquí puedes visualizar cómo han evolucionado tus emociones.`
            : "Visualiza cómo han evolucionado tus emociones en el tiempo."}
        </Text>
      </View>

      <View style={styles.cardsGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.cardIcon}>😟</Text>
          <Text style={styles.cardLabel}>Emoción dominante</Text>
          <Text style={styles.cardValue}>
            {stats.emocionDominante ?? "N/A"}
          </Text>
          <Text style={styles.cardHint}>{stats.porcentajeDominante}%</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardIcon}>⚠️</Text>
          <Text style={styles.cardLabel}>Estado general</Text>
          <Text style={styles.cardValue}>{stats.estadoGeneral}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardIcon}>🗂️</Text>
          <Text style={styles.cardLabel}>Registros totales</Text>
          <Text style={styles.cardValue}>{stats.totalRegistros}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.cardIcon}>🔥</Text>
          <Text style={styles.cardLabel}>Riesgo alto</Text>
          <Text style={styles.cardValue}>{stats.riesgoAltoPorcentaje}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribución de emociones</Text>
        {pieData.length > 0 ? (
          <>
            <PieChart
              data={pieData}
              width={screenWidth - 56}
              height={220}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
              absolute
              chartConfig={{
                color: () => "#000",
              }}
            />
            <Text style={styles.sectionNote}>
              Tu emoción más frecuente es{" "}
              <Text style={styles.boldText}>{stats.emocionDominante}</Text>.
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>No hay datos para mostrar.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendencia en los últimos 7 días</Text>
        <LineChart
          data={lineData}
          width={screenWidth - 56}
          height={220}
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            propsForDots: {
              r: "4",
              strokeWidth: "2",
              stroke: "#2F80ED",
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.interpretationHeader}>
          <Text style={styles.sectionTitle}>Interpretación general</Text>
          <Text style={styles.badge}>{stats.estadoGeneral}</Text>
        </View>
        <Text style={styles.interpretationText}>{resumenTexto}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EAF1F7",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF1F7",
  },
  loadingText: {
    marginTop: 10,
    color: "#4D5B66",
    fontSize: 16,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#263238",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5B6770",
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  summaryCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 13,
    color: "#6B7785",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#263238",
    textTransform: "capitalize",
  },
  cardHint: {
    marginTop: 4,
    color: "#2F80ED",
    fontWeight: "700",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#263238",
    marginBottom: 12,
  },
  sectionNote: {
    marginTop: 8,
    fontSize: 14,
    color: "#4D5B66",
  },
  boldText: {
    fontWeight: "800",
    color: "#2F80ED",
  },
  chart: {
    borderRadius: 12,
  },
  emptyText: {
    color: "#6B7785",
    fontSize: 14,
  },
  interpretationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#EEF4FF",
    color: "#2F80ED",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  interpretationText: {
    fontSize: 14,
    lineHeight: 24,
    color: "#4D5B66",
  },
});
