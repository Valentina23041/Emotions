from transformers import pipeline


class EmotionClassifier:

    def __init__(self):
        self.classifier = pipeline(
            "sentiment-analysis",
            model="pysentimiento/robertuito-sentiment-analysis"
        )

    def classify(self, text):
        texto = text.lower()

        palabras_alegria = [
            "feliz", "contento", "emocionado", "alegre",
            "muy bien", "excelente", "genial", "motivado"
        ]

        palabras_tristeza = [
            "triste", "mal", "deprimido", "vacío",
            "solo", "desanimado"
        ]

        palabras_miedo = [
            "ansioso", "miedo", "nervioso",
            "preocupado", "estresado", "ansiedad"
        ]

        palabras_ira = [
            "enojado", "furioso", "rabia",
            "molesto", "frustrado"
        ]

        if any(p in texto for p in palabras_alegria):
            return {
                "emotion": "felicidad",
                "sentiment": "positivo",
                "confidence": 0.95
            }

        if any(p in texto for p in palabras_tristeza):
            return {
                "emotion": "tristeza",
                "sentiment": "negativo",
                "confidence": 0.95
            }

        if any(p in texto for p in palabras_miedo):
            return {
                "emotion": "miedo",
                "sentiment": "negativo",
                "confidence": 0.93
            }

        if any(p in texto for p in palabras_ira):
            return {
                "emotion": "ira",
                "sentiment": "negativo",
                "confidence": 0.93
            }

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