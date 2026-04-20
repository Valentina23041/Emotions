from infrastructure.user_repository import UserRepository


class AuthService:

    def __init__(self):
        self.repo = UserRepository()

    def registrar_usuario(self, data):
        nombres = data.get("nombres", "").strip()
        apellidos = data.get("apellidos", "").strip()
        correo = data.get("correo", "").strip().lower()
        contrasena = data.get("contrasena", "").strip()
        acepta_politicas = data.get("aceptaPoliticas", False)

        if not nombres or not apellidos or not correo or not contrasena:
            return {"error": "Todos los campos son obligatorios"}

        if "@" not in correo:
            return {"error": "Correo inválido"}

        if len(contrasena) < 6:
            return {"error": "La contraseña debe tener al menos 6 caracteres"}

        if not acepta_politicas:
            return {"error": "Debes aceptar las políticas"}

        return self.repo.crear_usuario({
            "nombres": nombres,
            "apellidos": apellidos,
            "correo": correo,
            "contrasena": contrasena,
            "aceptaPoliticas": acepta_politicas
        })

    def iniciar_sesion(self, data):
        correo = data.get("correo", "").strip().lower()
        contrasena = data.get("contrasena", "").strip()

        if not correo or not contrasena:
            return {"error": "Correo y contraseña son obligatorios"}

        usuario = self.repo.obtener_usuario_por_correo(correo)

        if not usuario:
            return {"error": "Usuario no encontrado"}

        if usuario.get("contrasena") != contrasena:
            return {"error": "Contraseña incorrecta"}

        return {
            "idUsuario": usuario["idUsuario"],
            "nombres": usuario.get("nombres"),
            "apellidos": usuario.get("apellidos"),
            "correo": usuario.get("correo")
        }