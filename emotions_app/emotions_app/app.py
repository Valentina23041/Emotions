from flask import Flask
from flask_cors import CORS
from presentation.emotion_controller import emotion_bp
from presentation.auth_controller import auth_bp
from presentation.admin_controller import admin_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(emotion_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)