from datetime import datetime
from infrastructure.firebase_config import db


class EmotionRepository:

    def crear_sesion(self, id_usuario):
        ref = db.collection("sesiones_emocionales").document()

        ref.set({
            "idUsuario": id_usuario,
            "estadoInicial": "pendiente",
            "estadoSesion": "iniciada",
            "pasoActual": 1,
            "fechaCreacion": datetime.now()
        })

        return ref.id

    def obtener_sesion(self, session_id):
        doc = db.collection("sesiones_emocionales").document(session_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def actualizar_sesion(self, session_id, datos):
        db.collection("sesiones_emocionales").document(session_id).update(datos)

    def guardar_mensaje(self, session_id, tipo, texto, orden):
        db.collection("sesiones_emocionales") \
            .document(session_id) \
            .collection("mensajes") \
            .add({
                "tipo": tipo,
                "texto": texto,
                "orden": orden,
                "timestamp": datetime.now()
            })

    def contar_mensajes(self, session_id):
        docs = db.collection("sesiones_emocionales") \
            .document(session_id) \
            .collection("mensajes") \
            .stream()

        return sum(1 for _ in docs)

    def crear_alerta(self, data):
        db.collection("alertas_bienestar").add(data)

    def timestamp_actual(self):
        return datetime.now()

    def obtener_sesiones_por_usuario(self, id_usuario):
        docs = db.collection("sesiones_emocionales") \
            .where("idUsuario", "==", id_usuario) \
            .stream()

        return [
            {**doc.to_dict(), "id": doc.id}
            for doc in docs
        ]