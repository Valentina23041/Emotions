from flask import Blueprint, request, jsonify
from application.emotion_service import EmotionService

emotion_bp = Blueprint("emotion", __name__)
service = EmotionService()


@emotion_bp.route("/chat/iniciar", methods=["POST"])
def iniciar_chat():
    data = request.get_json()
    id_usuario = data.get("idUsuario")

    if not id_usuario:
        return jsonify({"error": "idUsuario es obligatorio"}), 400

    resultado = service.iniciar_chat(id_usuario)
    return jsonify(resultado), 200


@emotion_bp.route("/chat/responder", methods=["POST"])
def responder_chat():
    data = request.get_json()
    session_id = data.get("session_id")
    texto = data.get("texto")

    if not session_id or not texto:
        return jsonify({"error": "session_id y texto son obligatorios"}), 400

    resultado = service.procesar_mensaje(session_id, texto)

    if "error" in resultado:
        return jsonify(resultado), 404

    return jsonify(resultado), 200


@emotion_bp.route("/estadisticas/<id_usuario>", methods=["GET"])
def obtener_estadisticas(id_usuario):
    resultado = service.obtener_estadisticas(id_usuario)
    return jsonify(resultado), 200

@emotion_bp.route("/palabras-emocionales", methods=["GET"])
def obtener_palabras_emocionales():
    resultado = service.obtener_palabras_emocionales()
    return jsonify(resultado), 200


@emotion_bp.route("/palabras-emocionales", methods=["POST"])
def agregar_palabra_emocional():
    data = request.get_json()

    palabra = data.get("palabra")
    emocion = data.get("emocion")
    sentiment = data.get("sentiment")
    confidence = data.get("confidence", 0.90)

    if not palabra or not emocion or not sentiment:
        return jsonify({
            "error": "Los campos palabra, emocion y sentiment son obligatorios"
        }), 400

    emociones_validas = ["felicidad", "tristeza", "miedo", "ira"]
    sentiments_validos = ["positivo", "negativo", "neutral"]

    if emocion not in emociones_validas:
        return jsonify({
            "error": "La emocion debe ser: felicidad, tristeza, miedo o ira"
        }), 400

    if sentiment not in sentiments_validos:
        return jsonify({
            "error": "El sentiment debe ser: positivo, negativo o neutral"
        }), 400

    nueva_palabra = service.agregar_palabra_emocional(
        palabra=palabra,
        emocion=emocion,
        sentiment=sentiment,
        confidence=confidence
    )

    return jsonify({
        "mensaje": "Palabra emocional agregada correctamente",
        "data": nueva_palabra
    }), 201