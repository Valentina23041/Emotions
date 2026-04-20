from flask import Blueprint, request, jsonify
from application.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)
service = AuthService()


@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    resultado = service.registrar_usuario(data)

    if "error" in resultado:
        return jsonify(resultado), 400

    return jsonify({
        "message": "Usuario registrado correctamente",
        "user": resultado
    }), 201


@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    resultado = service.iniciar_sesion(data)

    if "error" in resultado:
        return jsonify(resultado), 400

    return jsonify({
        "message": "Inicio de sesión exitoso",
        "user": resultado
    }), 200