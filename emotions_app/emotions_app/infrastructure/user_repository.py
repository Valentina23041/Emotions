from datetime import datetime
from infrastructure.firebase_config import db


class UserRepository:

    def crear_usuario(self, data):
        correo = data["correo"].strip().lower()

        existente = db.collection("usuarios").where("correo", "==", correo).stream()
        if any(True for _ in existente):
            return {"error": "Ya existe una cuenta con ese correo"}

        ref = db.collection("usuarios").document()

        usuario = {
            "nombres": data["nombres"].strip(),
            "apellidos": data["apellidos"].strip(),
            "correo": correo,
            "contrasena": data["contrasena"],
            "aceptaPoliticas": data.get("aceptaPoliticas", False),
            "estado": True,
            "fechaRegistro": datetime.now()
        }

        ref.set(usuario)

        return {
            "idUsuario": ref.id,
            "nombres": usuario["nombres"],
            "apellidos": usuario["apellidos"],
            "correo": usuario["correo"]
        }

    def obtener_usuario_por_correo(self, correo):
        correo = correo.strip().lower()
        docs = db.collection("usuarios").where("correo", "==", correo).stream()

        for doc in docs:
            data = doc.to_dict()
            data["idUsuario"] = doc.id
            return data

        return None