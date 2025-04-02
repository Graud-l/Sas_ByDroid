from flask import Flask, render_template, request, jsonify
from langdetect import detect, LangDetectException
from datetime import datetime
import os
from dotenv import load_dotenv
import openai  # Importer la bibliothèque OpenAI
from mistralai import Mistral

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Récupérer la clé API
# API_KEY = os.getenv("API_KEY")
API_KEY = "CH7boNWr5wDZZp0uwTAFNzTvNsFAP6UH"

app = Flask(__name__)

class SasBydroid:
    def __init__(self):
        self.name = "Sas_Bydroid"
        self.company = "Sasaki Company"
        self.creators = ["Équipe Technique Sasaki", "Collaborateurs Open Source"]
        self.version = "1.0"
        self.api_key = API_KEY  # Utiliser la clé API MistralAi
        self.model = "codestral-latest"
        self.client = Mistral(api_key=self.api_key)

    def get_response(self, query, lang="fr"):
        # Vérifiez si la clé API est disponible
        if not self.api_key:
            return "Erreur : Clé API manquante."

        # Appeler l'API OpenAI pour générer une réponse
        try:
            chat_response = self.client.chat.complete(
                model= self.model,
                messages = [
                    {
                        "role": "user",
                        "content": query,
                    },
                ]
            )
            return chat_response.choices[0].message.content.strip()
        except Exception as e:
            return f"Erreur lors de l'appel à l'API OpenAI : {str(e)}"

@app.route("/")
def home():
    bot = SasBydroid()
    return render_template("index.html", 
                          bot_name=bot.name,
                          company=bot.company,
                          version=bot.version)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json or {}  # Assure que data est un dictionnaire même si request.json est None
    query = data.get("query", "").strip()
    lang = data.get("lang", "fr")  # Langue par défaut : français

    if not query:  # Vérifie si la requête est vide
        return jsonify({"error": "La requête est vide."}), 400

    bot = SasBydroid()
    response = bot.get_response(query, lang)

    return jsonify({
        "response": response,
        "creators": bot.creators
    })

@app.route("/use-api", methods=["POST"])
def use_api():
    if not API_KEY:
        return jsonify({"error": "Clé API manquante"}), 500

    # Exemple d'utilisation de la clé API
    data = request.json
    query = data.get("query", "")

    # Simulez un appel API avec la clé
    response = {
        "message": f"Votre requête '{query}' a été reçue.",
        "api_key_used": API_KEY[:10] + "..."  # Masquez une partie de la clé pour des raisons de sécurité
    }
    return jsonify(response)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # Ajout explicite du port et de l'hôte