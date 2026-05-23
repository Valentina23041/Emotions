from flask import Blueprint, request, jsonify
from infrastructure.firebase_config import db

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    data = request.get_json()

    correo = data.get("correo", "").strip().lower()
    contrasena = data.get("contrasena", "").strip()

    if correo == "admin@unimayor.edu.co" and contrasena == "admin123":
        return jsonify({
            "message": "Administrador autenticado correctamente",
            "admin": {
                "correo": correo,
                "rol": "administrador"
            }
        }), 200

    return jsonify({
        "error": "Credenciales de administrador incorrectas"
    }), 401


@admin_bp.route("/admin/sesiones", methods=["GET"])
def obtener_sesiones_admin():
    sesiones_ref = db.collection("sesiones_emocionales").stream()

    usuarios_dict = {}

    for doc in sesiones_ref:
        data = doc.to_dict()

        id_usuario = data.get("idUsuario", "N/A")

        correo_usuario = "Correo no encontrado"
        nombres_usuario = "Usuario"

        try:
            user_doc = db.collection("usuarios").document(id_usuario).get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                correo_usuario = user_data.get("correo", "Correo no encontrado")
                nombres_usuario = user_data.get("nombres", "Usuario")
        except Exception as e:
            print("Error obteniendo usuario:", e)

        registro = {
            "sessionId": doc.id,
            "estadoSesion": data.get("estadoSesion", "N/A"),
            "emocionDetectada": data.get("emocionDetectada", "N/A"),
            "confianza": data.get("confianza", 0),
            "nivelRiesgo": data.get("nivelRiesgo", "N/A"),
            "estadoGeneral": data.get("estadoGeneral", "N/A"),
            "requiereSeguimiento": data.get("requiereSeguimiento", False),
            "fechaCreacion": str(data.get("fechaCreacion", "N/A")),
        }

        if id_usuario not in usuarios_dict:
            usuarios_dict[id_usuario] = {
                "idUsuario": id_usuario,
                "correo": correo_usuario,
                "nombres": nombres_usuario,
                "registros": []
            }

        usuarios_dict[id_usuario]["registros"].append(registro)

    usuarios = list(usuarios_dict.values())

    return jsonify({
        "totalUsuarios": len(usuarios),
        "usuarios": usuarios
    }), 200