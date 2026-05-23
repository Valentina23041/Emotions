from collections import Counter
from datetime import datetime, timedelta
from infrastructure.emotion_repository import EmotionRepository
from domain.emotion_classifier import EmotionClassifier


class EmotionService:

    def __init__(self):
        self.repo = EmotionRepository()
        self.classifier = EmotionClassifier()
        self.preguntas = {
            1: "¿Cómo te sientes el día de hoy?",
            2: "Describe tu situación.",
            3: "Describe tu pensamiento.",
            4: "Describe tu emoción."
        }

    def iniciar_chat(self, id_usuario):
        session_id = self.repo.crear_sesion(id_usuario)

        pregunta_inicial = self.preguntas[1]
        self.repo.guardar_mensaje(session_id, "bot", pregunta_inicial, 1)

        return {
            "session_id": session_id,
            "respuesta": pregunta_inicial,
            "finalizado": False
        }

    def calcular_riesgo(self, emocion, confianza):
        if emocion in ["Tristeza", "Miedo", "Ira"] and confianza > 0.7:
            return "alto"
        elif emocion in ["Tristeza", "Miedo", "Ira"]:
            return "medio"
        else:
            return "bajo"

    def generar_recomendacion(self, emocion):
        if emocion == "Tristeza":
            return "Lamento que estés pasando por esto. Hablar con alguien de confianza puede ayudarte y también sería recomendable recibir apoyo profesional."
        elif emocion == "Miedo":
            return "Parece que estás experimentando miedo o ansiedad. Intenta respirar profundamente, buscar un espacio tranquilo y apoyarte en una persona de confianza."
        elif emocion == "Ira":
            return "Detecté emociones asociadas a frustración o ira. Tómate un momento para pausar, respirar y expresar lo que sientes de forma segura."
        elif emocion == "Alegría":
            return "Qué bueno que estés experimentando una emoción positiva. Reconocer estos momentos también fortalece tu bienestar emocional."
        else:
            return "Gracias por compartir cómo te sientes. Tu bienestar emocional es importante y merece atención."

    def generar_mensaje_apoyo(self, emocion):
        if emocion == "Tristeza":
            return (
                "Gracias por compartir cómo te sientes. Lo que estás viviendo es importante. "
                "Aunque este momento pueda sentirse pesado, no tienes que enfrentarlo solo."
            )
        elif emocion == "Miedo":
            return (
                "Gracias por abrir este espacio y expresar cómo te sientes. "
                "Lo que estás experimentando merece atención y acompañamiento. "
                "No estás solo, pedir ayuda también es una forma de cuidarte."
            )
        elif emocion == "Ira":
            return (
                "Gracias por expresar lo que sientes. Es válido reconocer emociones intensas, "
                "y hacerlo ya es un paso importante para manejar la situación de una mejor manera."
            )
        elif emocion == "Alegría":
            return (
                "Qué bueno que puedas reconocer esta emoción positiva. "
                "Identificar lo que te hace bien también fortalece tu bienestar emocional."
            )
        else:
            return (
                "Gracias por compartir cómo te sientes. Reconocer tus emociones es un paso valioso "
                "para cuidar tu bienestar."
            )

    def procesar_mensaje(self, session_id, texto):
        sesion = self.repo.obtener_sesion(session_id)

        if not sesion:
            return {"error": "Sesión no encontrada"}

        paso_actual = sesion.get("pasoActual", 1)
        id_usuario = sesion.get("idUsuario")

        orden_actual = self.repo.contar_mensajes(session_id) + 1
        self.repo.guardar_mensaje(session_id, "usuario", texto, orden_actual)

        if paso_actual == 1:
            self.repo.actualizar_sesion(session_id, {
                "respuestaEstadoHoy": texto,
                "pasoActual": 2
            })
            siguiente = self.preguntas[2]

        elif paso_actual == 2:
            self.repo.actualizar_sesion(session_id, {
                "respuestaSituacion": texto,
                "pasoActual": 3
            })
            siguiente = self.preguntas[3]

        elif paso_actual == 3:
            self.repo.actualizar_sesion(session_id, {
                "respuestaPensamiento": texto,
                "pasoActual": 4
            })
            siguiente = self.preguntas[4]

        elif paso_actual == 4:
            resultado = self.classifier.classify(texto)

            emocion = resultado["emotion"]
            confianza = resultado["confidence"]

            nivel_riesgo = self.calcular_riesgo(emocion, confianza)
            recomendacion = self.generar_recomendacion(emocion)
            mensaje_apoyo = self.generar_mensaje_apoyo(emocion)
            requiere_seguimiento = nivel_riesgo in ["medio", "alto"]

            puntaje_emocional = 1
            if emocion == "Neutral":
                puntaje_emocional = 2
            elif emocion == "Miedo":
                puntaje_emocional = 3
            elif emocion in ["Tristeza", "Ira"]:
                puntaje_emocional = 4

            estado_general = "alerta" if requiere_seguimiento else "favorable"

            self.repo.actualizar_sesion(session_id, {
                "respuestaEmocion": texto,
                "emocionDetectada": emocion,
                "confianza": confianza,
                "nivelRiesgo": nivel_riesgo,
                "mensajeRecomendacion": recomendacion,
                "requiereSeguimiento": requiere_seguimiento,
                "estadoSeguimiento": "pendiente" if requiere_seguimiento else "no_requerido",
                "areaResponsable": "Bienestar Institucional" if requiere_seguimiento else None,
                "estadoGeneral": estado_general,
                "puntajeEmocional": puntaje_emocional,
                "coherenciaEmocional": False,
                "porcentajeDiscrepancia": 25.0,
                "pasoActual": 5,
                "estadoSesion": "completada"
            })

            if requiere_seguimiento:
                alerta = {
                    "idUsuario": id_usuario,
                    "sessionId": session_id,
                    "emocionDetectada": emocion,
                    "confianza": confianza,
                    "nivelRiesgo": nivel_riesgo,
                    "motivo": f"Emoción {emocion} detectada",
                    "mensajeUsuario": texto,
                    "estado": "pendiente",
                    "prioridad": "alta" if nivel_riesgo == "alto" else "media",
                    "fechaCreacion": self.repo.timestamp_actual(),
                    "contactado": False,
                    "fechaContacto": None,
                    "observaciones": "",
                    "responsable": "Bienestar Institucional"
                }
                self.repo.crear_alerta(alerta)

            if requiere_seguimiento:
                respuesta_final = (
                    f"{mensaje_apoyo} "
                    f"Detecté señales asociadas a {emocion} con una confianza de {round(confianza * 100, 2)}%. "
                    f"{recomendacion} "
                    f"Además, un profesional de Bienestar Institucional se pondrá en contacto contigo "
                    f"para brindarte acompañamiento."
                )
            else:
                respuesta_final = (
                    f"{mensaje_apoyo} "
                    f"Detecté señales asociadas a {emocion} con una confianza de {round(confianza * 100, 2)}%. "
                    f"{recomendacion}"
                )

            self.repo.guardar_mensaje(
                session_id,
                "bot",
                respuesta_final,
                self.repo.contar_mensajes(session_id) + 1
            )

            return {
                "session_id": session_id,
                "respuesta": respuesta_final,
                "emocion": emocion,
                "confianza": confianza,
                "nivelRiesgo": nivel_riesgo,
                "requiereSeguimiento": requiere_seguimiento,
                "recomendacion": recomendacion,
                "finalizado": True
            }

        else:
            return {
                "session_id": session_id,
                "respuesta": "La sesión ya fue completada.",
                "finalizado": True
            }

        self.repo.guardar_mensaje(
            session_id,
            "bot",
            siguiente,
            self.repo.contar_mensajes(session_id) + 1
        )

        return {
            "session_id": session_id,
            "respuesta": siguiente,
            "finalizado": False
        }

    def obtener_estadisticas(self, id_usuario):
        sesiones = self.repo.obtener_sesiones_por_usuario(id_usuario)

        if not sesiones:
            return {
                "idUsuario": id_usuario,
                "totalRegistros": 0,
                "emocionDominante": None,
                "porcentajeDominante": 0,
                "estadoGeneral": "sin datos",
                "riesgoAltoPorcentaje": 0,
                "distribucionEmociones": {},
                "tendencia7Dias": []
            }

        sesiones_completadas = [
            s for s in sesiones
            if s.get("estadoSesion") == "completada" and s.get("emocionDetectada")
        ]

        total_registros = len(sesiones_completadas)

        if total_registros == 0:
            return {
                "idUsuario": id_usuario,
                "totalRegistros": 0,
                "emocionDominante": None,
                "porcentajeDominante": 0,
                "estadoGeneral": "sin datos",
                "riesgoAltoPorcentaje": 0,
                "distribucionEmociones": {},
                "tendencia7Dias": []
            }

        emociones = [s.get("emocionDetectada") for s in sesiones_completadas]
        conteo_emociones = Counter(emociones)

        emocion_dominante, cantidad_dominante = conteo_emociones.most_common(1)[0]
        porcentaje_dominante = round((cantidad_dominante / total_registros) * 100, 2)

        distribucion = {
            emocion: round((cantidad / total_registros) * 100, 2)
            for emocion, cantidad in conteo_emociones.items()
        }

        riesgos_altos = sum(
            1 for s in sesiones_completadas
            if s.get("nivelRiesgo") == "alto"
        )
        riesgo_alto_porcentaje = round((riesgos_altos / total_registros) * 100, 2)

        if riesgo_alto_porcentaje >= 25:
            estado_general = "alerta"
        elif emocion_dominante in ["Tristeza", "Miedo", "Ira"]:
            estado_general = "estable"
        else:
            estado_general = "favorable"

        hoy = datetime.now().date()
        dias = [(hoy - timedelta(days=i)) for i in range(6, -1, -1)]

        mapa_puntajes = {
            "Alegría": 1,
            "Neutral": 2,
            "Miedo": 3,
            "Tristeza": 4,
            "Ira": 4
        }

        tendencia = []

        for dia in dias:
            sesiones_dia = []
            for s in sesiones_completadas:
                fecha = s.get("fechaCreacion")
                if fecha and hasattr(fecha, "date") and fecha.date() == dia:
                    sesiones_dia.append(s)

            if sesiones_dia:
                puntajes = [
                    s.get("puntajeEmocional", mapa_puntajes.get(s.get("emocionDetectada"), 2))
                    for s in sesiones_dia
                ]
                promedio = round(sum(puntajes) / len(puntajes), 2)
            else:
                promedio = 0

            tendencia.append({
                "dia": dia.strftime("%a"),
                "valor": promedio
            })

        return {
            "idUsuario": id_usuario,
            "totalRegistros": total_registros,
            "emocionDominante": emocion_dominante,
            "porcentajeDominante": porcentaje_dominante,
            "estadoGeneral": estado_general,
            "riesgoAltoPorcentaje": riesgo_alto_porcentaje,
            "distribucionEmociones": distribucion,
            "tendencia7Dias": tendencia
        }