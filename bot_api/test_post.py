import requests

response = requests.post("http://localhost:5001/chat", json={"question": "What is ProcUrPal?"})
print(response.status_code)
print(response.text)
import google.generativeai as genai
import os

genai.configure(api_key='AIzaSyDq20fehivP-3CTI-dvSToNgflPepEG0JY')
model = genai.GenerativeModel("gemini-pro")
response = model.generate_content("Tell me about ProcUrPal's services")
print(response.text)
