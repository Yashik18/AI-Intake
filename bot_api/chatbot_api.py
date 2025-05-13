from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
import google.generativeai as genai
from pathlib import Path
import os

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Load CSV 
base_dir = Path(__file__).resolve().parent
csv_path = base_dir.parent / "server/data/procurpal_nlp_dataset.csv"
try:
    qa_df = pd.read_csv(csv_path)
except Exception as e:
    print("❌ Error loading CSV:", e)
    qa_df = pd.DataFrame()

model = genai.GenerativeModel("gemini-1.5-pro-latest")

# Function to find answer in dataset
def find_best_answer(user_question):
    for _, row in qa_df.iterrows():
        if user_question.lower() in row['question'].lower():
            return row['answer']
    return None

app = Flask(__name__)
CORS(app)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()

        if not question:
            return jsonify({"error": "No question provided"}), 400

        # Try finding in dataset first
        matched = find_best_answer(question)
        if matched:
            return jsonify({"answer": matched})

        # Use Gemini fallback
        prompt = f"""You are an AI assistant for ProcUrPal, a Procurement SaaS company.
If someone asks a question not found in a knowledge base, answer smartly using context and knowledge about procurement, AI tools, and business software.

Question: {question}
Answer:"""

        response = model.generate_content(prompt)
        answer = response.text.strip()

        return jsonify({"answer": answer})
    except Exception as e:
        print(f"Gemini error: {e}")
        return jsonify({"answer": "Sorry, I encountered an issue answering that. Please try again."})

if __name__ == '__main__':
    print("✅ Gemini chatbot running at http://localhost:5001/chat")
    app.run(port=5001)
