from transformers import pipeline


class EmotionClassifier:

    def __init__(self):
        self.classifier = pipeline(
            "sentiment-analysis",
            model="pysentimiento/robertuito-sentiment-analysis"
        )

    def classify(self, text):

        texto = text.lower()

        #  REGLAS MANUALES MÁS NATURALES
        palabras_alegria = [
            "feliz",
            "contento",
            "emocionado",
            "alegre",
            "muy bien",
            "excelente",
            "genial",
            "motivado"
        ]

        palabras_tristeza = [
            "triste",
            "mal",
            "deprimido",
            "vacío",
            "solo",
            "desanimado"
        ]

        palabras_miedo = [
            "ansioso",
            "miedo",
            "nervioso",
            "preocupado",
            "estresado",
            "ansiedad"
        ]

        palabras_ira = [
            "enojado",
            "furioso",
            "rabia",
            "molesto",
            "frustrado"
        ]

        #  PRIORIDAD A REGLAS HUMANAS
        if any(p in texto for p in palabras_alegria):
            return {
                "emotion": "felicidad",
                "confidence": 0.95
            }

        if any(p in texto for p in palabras_tristeza):
            return {
                "emotion": "tristeza",
                "confidence": 0.95
            }

        if any(p in texto for p in palabras_miedo):
            return {
                "emotion": "miedo",
                "confidence": 0.93
            }

        if any(p in texto for p in palabras_ira):
            return {
                "emotion": "ira",
                "confidence": 0.93
            }

        #  SI NO DETECTA NADA → USA IA
        result = self.classifier(text)[0]

        label = result["label"].lower()
        score = float(result["score"])

        if label in ["pos", "positive"]:
            emotion = "felicidad"

        elif label in ["neg", "negative"]:
            emotion = "tristeza"

        else:
            emotion = "neutral"

        return {
            "emotion": emotion,
            "confidence": score
        }