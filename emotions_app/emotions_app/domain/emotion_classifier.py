from transformers import pipeline
from difflib import SequenceMatcher
import spacy
import unicodedata

from infrastructure.emotion_repository import EmotionRepository


class EmotionClassifier:

    def __init__(self):
        # modelo RoBERTuito
        self.classifier = pipeline(
            "sentiment-analysis",
            model="pysentimiento/robertuito-sentiment-analysis"
        )

        # Modelo de spaCy para español
        self.nlp = spacy.load("es_core_news_sm")

        # Repositorio para consultar palabras emocionales desde Firebase
        self.emotion_repository = EmotionRepository()

        # Carga inicial de palabras desde Firebase
        self.palabras_emocionales = (
            self.emotion_repository.obtener_palabras_emocionales()
        )

    def refrescar_palabras_emocionales(self):
        """
        Vuelve a consultar Firebase para reconocer palabras nuevas
        sin tener que dejarlas escritas en el código.
        """
        self.palabras_emocionales = (
            self.emotion_repository.obtener_palabras_emocionales()
        )

    def normalizar_texto(self, texto):
        """
        Convierte el texto a minúsculas y elimina tildes.
        Ejemplo: 'vacío' -> 'vacio'
        """
        texto = texto.lower()
        texto = unicodedata.normalize("NFD", texto)
        texto = "".join(
            char for char in texto
            if unicodedata.category(char) != "Mn"
        )
        return texto

    def obtener_lemas(self, texto):
        """
        Tokeniza y lematiza el texto usando spaCy.
        Ejemplo:
        'Estoy muy preocupado' -> ['estar', 'mucho', 'preocupado']
        """
        texto_normalizado = self.normalizar_texto(texto)
        doc = self.nlp(texto_normalizado)

        lemas = [
            self.normalizar_texto(token.lemma_)
            for token in doc
            if not token.is_punct and not token.is_space
        ]

        return lemas

    def calcular_similitud(self, palabra1, palabra2):
        """
        Calcula qué tan parecidas son dos palabras.
        Retorna un valor entre 0 y 1.
        """
        return SequenceMatcher(None, palabra1, palabra2).ratio()

    def son_similares(self, palabra1, palabra2):
        """
        Compara dos palabras usando coincidencia exacta o similitud.
        Para palabras cortas exige coincidencia exacta para evitar errores.
        """
        palabra1 = self.normalizar_texto(palabra1)
        palabra2 = self.normalizar_texto(palabra2)

        if palabra1 == palabra2:
            return True

        # Evita falsos positivos con palabras muy cortas como "mal"
        if len(palabra1) <= 3 or len(palabra2) <= 3:
            return False

        similitud = self.calcular_similitud(palabra1, palabra2)

        return similitud >= 0.82

    def detectar_emocion_por_pln(self, texto):
        """
        Detecta emociones usando:
        - palabras cargadas desde Firebase
        - texto normalizado
        - tokenización
        - lematización
        - similitud con SequenceMatcher
        """
        texto_normalizado = self.normalizar_texto(texto)
        lemas_texto = self.obtener_lemas(texto)

        for item in self.palabras_emocionales:
            palabra_clave = item.get("palabra", "")
            emocion = item.get("emocion", "")
            sentiment = item.get("sentiment", "")
            confidence = item.get("confidence", 0.90)

            if not palabra_clave or not emocion or not sentiment:
                continue

            palabra_clave_normalizada = self.normalizar_texto(palabra_clave)

            # 1. Detecta frases completas como "muy bien"
            if " " in palabra_clave_normalizada:
                if palabra_clave_normalizada in texto_normalizado:
                    return {
                        "emotion": emocion,
                        "sentiment": sentiment,
                        "confidence": confidence
                    }

            # 2. Detecta palabras por lemas y similitud
            lemas_palabra_clave = self.obtener_lemas(palabra_clave)

            for lema_texto in lemas_texto:
                for lema_clave in lemas_palabra_clave:
                    if self.son_similares(lema_texto, lema_clave):
                        return {
                            "emotion": emocion,
                            "sentiment": sentiment,
                            "confidence": confidence
                        }

        return None

    def classify(self, text):
        # Consulta Firebase para reconocer palabras nuevas agregadas en la base de datos
        self.refrescar_palabras_emocionales()

        # Primero intenta detectar emoción con spaCy + SequenceMatcher + Firebase
        emocion_detectada = self.detectar_emocion_por_pln(text)

        if emocion_detectada:
            return emocion_detectada

        # Si no encuentra nada claro, usa RoBERTuito como respaldo
        result = self.classifier(text)[0]

        label = result["label"].lower()
        score = float(result["score"])

        if label in ["pos", "positive"]:
            emotion = "felicidad"
            sentiment = "positivo"

        elif label in ["neg", "negative"]:
            emotion = "tristeza"
            sentiment = "negativo"

        else:
            emotion = "estado emocional estable"
            sentiment = "neutral"

        return {
            "emotion": emotion,
            "sentiment": sentiment,
            "confidence": score
        }