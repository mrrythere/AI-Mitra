import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai


# Load .env
env_path = Path(__file__).resolve().parent / ".env"

load_dotenv(
    dotenv_path=env_path,
    override=True
)

gemini_api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=gemini_api_key)


# Test user message
user_message = "Nova, kya haal hai?"


prompt = f"""
Analyze the user's message and determine whether it contains
a useful long-term fact or preference about the user.

User message:
{user_message}

If there is a useful long-term memory, return ONLY valid JSON:

{{
    "save_memory": true,
    "memory_key": "short_descriptive_key",
    "memory_value": "value"
}}

If there is no useful long-term memory, return ONLY:

{{
    "save_memory": false,
    "memory_key": null,
    "memory_value": null
}}
"""


interaction = client.interactions.create(
    model="gemini-3.6-flash",
    input=prompt
)

raw_output = interaction.output_text.strip()

print("RAW AI OUTPUT:")
print(raw_output)


# Convert AI JSON text into Python dictionary
clean_output = raw_output.replace("```json", "").replace("```", "").strip()

memory_data = json.loads(clean_output)

print("\nPARSED MEMORY:")
print(memory_data)