export type TrendItem = {
  dia: string;
  valor: number;
};

export type StatisticsResponse = {
  idUsuario: string;
  totalRegistros: number;
  emocionDominante: string | null;
  porcentajeDominante: number;
  estadoGeneral: string;
  riesgoAltoPorcentaje: number;
  distribucionEmociones: Record<string, number>;
  tendencia7Dias: TrendItem[];
};
