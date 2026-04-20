import axios from "axios";

const API_URL = "http://127.0.0.1:5000";

export const getUserStatistics = async (userId: string) => {
  const response = await axios.get(`${API_URL}/estadisticas/${userId}`);
  return response.data;
};
export const registerUser = async (data: {
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  aceptaPoliticas: boolean;
}) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data;
};
export const iniciarChat = async (idUsuario: string) => {
  const response = await axios.post(`${API_URL}/chat/iniciar`, {
    idUsuario,
  });
  return response.data;
};

export const responderChat = async (sessionId: string, texto: string) => {
  const response = await axios.post(`${API_URL}/chat/responder`, {
    session_id: sessionId,
    texto,
  });
  return response.data;
};
