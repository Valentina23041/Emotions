from transformers import pipeline

class EmotionClassifier:

    def __init__(self):
        self.classifier = pipeline(
            "text-classification",
            model="finiteautomata/beto-emotion-analysis",
            return_all_scores=False
        )

        self.label_mapping = {
            "joy": "Alegría",
            "sadness": "Tristeza",
            "anger": "Ira",
            "fear": "Miedo",
            "others": "Neutral"
        }

    def classify(self, text: str) -> dict:
        result = self.classifier(text)[0]
        label = result["label"]
        score = result["score"]

        emotion = self.label_mapping.get(label, "Neutral")

        return {
            "emotion": emotion,
            "confidence": round(score, 4)
        }