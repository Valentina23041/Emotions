import os
import json
import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    firebase_json = os.environ.get("FIREBASE_CONFIG")

    if firebase_json:
        firebase_config = json.loads(firebase_json)
        cred = credentials.Certificate(firebase_config)
    else:
        cred = credentials.Certificate("firebase_key.json")

    firebase_admin.initialize_app(cred)

db = firestore.client()