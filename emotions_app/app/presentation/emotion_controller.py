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