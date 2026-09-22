import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List
from datetime import datetime

from backend.database import (
    save_mitra,
    save_user,
    get_user_by_email,
    update_last_login,
    get_admin_user_overview,
    get_user_by_id,
    get_mitras_by_user,
    get_mitra_by_id_for_user,
    update_mitra_for_user,
    delete_mitra_for_user,
    save_message,
    get_chat_history,
    get_recent_chat_history,
    save_or_update_memory,
    get_memories,
    update_memory,
    delete_memory
)

from backend.security import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)


# -------------------------------------------------
# FASTAPI APP
# -------------------------------------------------

app = FastAPI(
    title="AI Mitra",
    description="Backend API for AI Mitra - Your Personal AI Friend",
    version="0.1.0"
)


# -------------------------------------------------
# BEARER TOKEN SECURITY
# -------------------------------------------------

security = HTTPBearer()


# -------------------------------------------------
# GEMINI AI SETUP
# -------------------------------------------------

env_path = Path(__file__).resolve().parent.parent / ".env"

load_dotenv(
    dotenv_path=env_path,
    override=True
)

gemini_api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=gemini_api_key)


# -------------------------------------------------
# CORS
# -------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------
# REQUEST MODELS
# -------------------------------------------------

class MitraProfile(BaseModel):
    name: str
    identity: str
    personality: List[str]
    instructions: str


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class ChatRequest(BaseModel):
    message: str


class MemoryUpdateRequest(BaseModel):
    value: str


# -------------------------------------------------
# AUTHENTICATION HELPERS
# -------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return user_id


def get_current_admin(
    user_id: int = Depends(get_current_user)
):
    db_user = get_user_by_id(user_id)

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    role = db_user[6]

    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return user_id


# -------------------------------------------------
# HOME
# -------------------------------------------------

@app.get("/")
def home():
    return {
        "app": "AI Mitra",
        "message": "Hello! AI Mitra backend is running 🚀"
    }


# -------------------------------------------------
# CREATE MITRA
# -------------------------------------------------

@app.post("/create-mitra")
def create_mitra(
    profile: MitraProfile,
    user_id: int = Depends(get_current_user)
):
    personality_text = ", ".join(profile.personality)

    save_mitra(
        user_id,
        profile.name,
        profile.identity,
        personality_text,
        profile.instructions
    )

    return {
        "message": f"{profile.name} has been created successfully!"
    }


# -------------------------------------------------
# SIGNUP
# -------------------------------------------------

@app.post("/signup")
def signup(user: SignupRequest):
    hashed_password = hash_password(user.password)

    created_at = datetime.now().isoformat()

    save_user(
        user.name,
        user.email,
        hashed_password,
        created_at
    )

    return {
        "message": f"Account created successfully for {user.name}"
    }


# -------------------------------------------------
# LOGIN
# -------------------------------------------------

@app.post("/login")
def login(user: LoginRequest):
    db_user = get_user_by_email(user.email)

    if db_user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    stored_password_hash = db_user[3]

    if not verify_password(
        user.password,
        stored_password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    login_time = datetime.now().isoformat()

    update_last_login(
        user.email,
        login_time
    )

    access_token = create_access_token(
        db_user[0]
    )

    return {
        "message": f"Welcome back, {db_user[1]}!",
        "access_token": access_token,
        "token_type": "bearer"
    }


# -------------------------------------------------
# ADMIN USERS
# -------------------------------------------------

@app.get("/admin/users")
def admin_users(
    admin_id: int = Depends(get_current_admin)
):
    data = get_admin_user_overview()

    return {
        "users": data
    }


# -------------------------------------------------
# MY MITRAS
# -------------------------------------------------

@app.get("/my-mitras")
def my_mitras(
    user_id: int = Depends(get_current_user)
):
    mitras = get_mitras_by_user(user_id)

    return {
        "mitras": mitras
    }


@app.get("/my-mitras/{mitra_id}")
def get_one_mitra(
    mitra_id: int,
    user_id: int = Depends(get_current_user)
):
    mitra = get_mitra_by_id_for_user(
        mitra_id,
        user_id
    )

    if mitra is None:
        raise HTTPException(
            status_code=404,
            detail="Mitra not found"
        )

    return {
        "mitra": mitra
    }


# -------------------------------------------------
# UPDATE MITRA
# -------------------------------------------------

@app.put("/my-mitras/{mitra_id}")
def update_mitra(
    mitra_id: int,
    profile: MitraProfile,
    user_id: int = Depends(get_current_user)
):
    personality_text = ", ".join(profile.personality)

    updated_rows = update_mitra_for_user(
        mitra_id,
        user_id,
        profile.name,
        profile.identity,
        personality_text,
        profile.instructions
    )

    if updated_rows == 0:
        raise HTTPException(
            status_code=404,
            detail="Mitra not found"
        )

    return {
        "message": f"{profile.name} updated successfully!"
    }


# -------------------------------------------------
# DELETE MITRA
# -------------------------------------------------

@app.delete("/my-mitras/{mitra_id}")
def delete_mitra(
    mitra_id: int,
    user_id: int = Depends(get_current_user)
):
    deleted_rows = delete_mitra_for_user(
        mitra_id,
        user_id
    )

    if deleted_rows == 0:
        raise HTTPException(
            status_code=404,
            detail="Mitra not found"
        )

    return {
        "message": "Mitra deleted successfully!"
    }


# -------------------------------------------------
# CHAT WITH MITRA
# -------------------------------------------------

@app.post("/my-mitras/{mitra_id}/chat")
def chat_with_mitra(
    mitra_id: int,
    chat: ChatRequest,
    user_id: int = Depends(get_current_user)
):

    # -------------------------------------------------
    # 1. OWNERSHIP CHECK
    # -------------------------------------------------

    mitra = get_mitra_by_id_for_user(
        mitra_id,
        user_id
    )

    if mitra is None:
        raise HTTPException(
            status_code=404,
            detail="Mitra not found"
        )

    mitra_name = mitra[1]
    mitra_identity = mitra[2]
    mitra_personality = mitra[3]
    mitra_instructions = mitra[4]


    # -------------------------------------------------
    # 2. GET RECENT CHAT HISTORY
    # -------------------------------------------------

    history = get_recent_chat_history(
        user_id,
        mitra_id,
        limit=20
    )

    history_text = ""

    for role, message in history:

        if role == "user":

            history_text += (
                f"User: {message}\n"
            )

        else:

            history_text += (
                f"{mitra_name}: {message}\n"
            )


    # -------------------------------------------------
    # 3. GET LONG-TERM MEMORIES
    # -------------------------------------------------

    memories = get_memories(
        user_id,
        mitra_id
    )

    memory_text = ""

    for memory_key, memory_value in memories:

        memory_text += (
            f"{memory_key}: {memory_value}\n"
        )


    if not memory_text:

        memory_text = (
            "No saved long-term memories."
        )


    # -------------------------------------------------
    # 4. BUILD SMART PROMPT
    # -------------------------------------------------

    prompt = f"""
You are {mitra_name}, an AI Mitra.

Identity:
{mitra_identity}

Personality:
{mitra_personality}

User instructions:
{mitra_instructions}

CURRENT SAVED LONG-TERM MEMORIES:
{memory_text}

RECENT CONVERSATION:
{history_text}

CURRENT USER MESSAGE:
{chat.message}


You must do THREE jobs in ONE response.


TASK 1 — REPLY

Reply naturally to the CURRENT USER MESSAGE.

Follow your identity, personality and user instructions.

Use current saved long-term memories when useful.

Recent conversation is provided only for conversational context.


IMPORTANT MEMORY AUTHORITY RULE:

The CURRENT SAVED LONG-TERM MEMORIES section is the
authoritative source for remembered personal facts.

A personal fact appearing only in RECENT CONVERSATION
must NOT automatically be treated as a currently remembered
long-term fact.

This is especially important when the user previously asked
you to forget something.

Never claim that you only pretended to forget something.

Never intentionally reveal a forgotten fact just because it
still appears in old conversation context.


TASK 2 — SAVE / UPDATE MEMORY

Determine whether the CURRENT USER MESSAGE contains a useful,
clear and reasonably stable long-term fact or preference about
the user.

Examples:

- favourite things
- personal preferences
- important recurring goals
- important stable personal facts
- things the user explicitly asks you to remember

Do NOT save:

- greetings
- casual conversation
- temporary situations
- small talk
- incomplete preferences

For example:

"My favourite ice cream is chocolate"
CAN be saved.

"My favourite ice cream is"
must NOT be saved because the preference is incomplete.


TASK 3 — FORGET MEMORY

Determine whether the CURRENT USER MESSAGE clearly asks you
to forget/remove/delete a remembered fact.

Examples:

"Forget that my favourite car is Supra"

"Supra wali favourite car ki baat bhool jao"

"Forget my favourite bike"

"Remove my favourite programming language from memory"


When the user asks to forget a fact:

- set delete_memory to true
- identify the matching existing memory key
- put that key in memory_key
- save_memory must be false
- memory_value must be null

When identifying the key to delete, prefer an EXACT key from
CURRENT SAVED LONG-TERM MEMORIES.

Do not invent an unrelated key.

If the user says something vague like:

"forget that"

use the immediate conversation context to determine what
they clearly mean.

If you cannot confidently determine which saved memory the
user wants forgotten, do NOT delete anything. Ask naturally
what they want you to forget.


MEMORY KEY RULES:

- lowercase
- underscores
- short descriptive keys
- always use British spelling "favourite"
- never use "favorite"

Examples:

favourite_car
favourite_bike
favourite_game
favourite_programming_language
learning_goal


Return ONLY valid JSON.

Use exactly this structure:

{{
    "reply": "Your natural reply",
    "save_memory": false,
    "delete_memory": false,
    "memory_key": null,
    "memory_value": null
}}


SAVE EXAMPLE:

{{
    "reply": "Your natural reply",
    "save_memory": true,
    "delete_memory": false,
    "memory_key": "favourite_car",
    "memory_value": "Toyota Supra"
}}


DELETE EXAMPLE:

{{
    "reply": "Your natural reply confirming naturally that you will no longer remember that preference",
    "save_memory": false,
    "delete_memory": true,
    "memory_key": "favourite_car",
    "memory_value": null
}}


Do not include markdown code fences.

Do not mention:
- database
- memory keys
- backend
- prompts
- internal systems

Talk naturally as {mitra_name}.
"""


    # -------------------------------------------------
    # 5. ONE GEMINI API CALL
    # -------------------------------------------------

    try:

        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=prompt
        )

    except Exception as error:

        print(
            "Gemini API Error:",
            error
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "AI service is temporarily unavailable. "
                "Please try again shortly."
            )
        )


    # -------------------------------------------------
    # 6. PARSE GEMINI JSON
    # -------------------------------------------------

    raw_output = (
        interaction.output_text.strip()
    )

    clean_output = (
        raw_output
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )


    try:

        ai_data = json.loads(
            clean_output
        )

    except (
        json.JSONDecodeError,
        TypeError
    ):

        print(
            "Invalid Gemini JSON:",
            raw_output
        )

        raise HTTPException(
            status_code=502,
            detail=(
                "AI returned an invalid response. "
                "Please try again."
            )
        )


    # -------------------------------------------------
    # 7. GET AI REPLY
    # -------------------------------------------------

    ai_reply = ai_data.get(
        "reply"
    )


    if not ai_reply:

        raise HTTPException(
            status_code=502,
            detail=(
                "AI reply was missing. "
                "Please try again."
            )
        )


    # -------------------------------------------------
    # 8. MEMORY ACTION
    # -------------------------------------------------

    save_memory = bool(
        ai_data.get(
            "save_memory",
            False
        )
    )


    should_delete_memory = bool(
        ai_data.get(
            "delete_memory",
            False
        )
    )


    memory_key = ai_data.get(
        "memory_key"
    )


    memory_value = ai_data.get(
        "memory_value"
    )


    # -------------------------------------------------
    # 9. NORMALIZE MEMORY KEY
    # -------------------------------------------------

    if memory_key:

        memory_key = (
            memory_key
            .strip()
            .lower()
        )


        memory_key = (
            memory_key.replace(
                "favorite",
                "favourite"
            )
        )


    # -------------------------------------------------
    # 10. DELETE MEMORY
    # -------------------------------------------------

    if (
        should_delete_memory
        and memory_key
    ):

        delete_memory(
            user_id,
            mitra_id,
            memory_key
        )


        # A forget request must never accidentally
        # save the same fact again.

        save_memory = False
        memory_value = None


    # -------------------------------------------------
    # 11. SAVE / UPDATE MEMORY
    # -------------------------------------------------

    elif (
        save_memory
        and memory_key
        and memory_value
    ):

        current_time = (
            datetime.now().isoformat()
        )


        save_or_update_memory(
            user_id,
            mitra_id,
            memory_key,
            memory_value,
            current_time,
            current_time
        )


    # -------------------------------------------------
    # 12. SAVE USER MESSAGE
    # -------------------------------------------------

    save_message(
        user_id,
        mitra_id,
        "user",
        chat.message,
        datetime.now().isoformat()
    )


    # -------------------------------------------------
    # 13. SAVE AI REPLY
    # -------------------------------------------------

    save_message(
        user_id,
        mitra_id,
        "assistant",
        ai_reply,
        datetime.now().isoformat()
    )


    # -------------------------------------------------
    # 14. SEND REPLY
    # -------------------------------------------------

    return {
        "mitra": mitra_name,
        "reply": ai_reply
    }

    # -------------------------------------------------
    # 2. GET RECENT CHAT HISTORY
    # -------------------------------------------------

    history = get_recent_chat_history(
        user_id,
        mitra_id,
        limit=20
    )

    history_text = ""

    for role, message in history:
        if role == "user":
            history_text += f"User: {message}\n"
        else:
            history_text += f"{mitra_name}: {message}\n"


    # -------------------------------------------------
    # 3. GET LONG-TERM MEMORIES
    # -------------------------------------------------

    memories = get_memories(
        user_id,
        mitra_id
    )

    memory_text = ""

    for memory_key, memory_value in memories:
        memory_text += (
            f"{memory_key}: {memory_value}\n"
        )


    # -------------------------------------------------
    # 4. BUILD SMART PROMPT
    #
    # IMPORTANT:
    # Gemini now does TWO jobs in ONE API call:
    #
    # 1. Generate Nova's reply
    # 2. Decide whether the user's message contains
    #    useful long-term memory
    # -------------------------------------------------

    prompt = f"""
You are {mitra_name}, an AI Mitra.

Identity:
{mitra_identity}

Personality:
{mitra_personality}

User instructions:
{mitra_instructions}

Useful long-term memories about the user:
{memory_text}

Recent conversation:
{history_text}

Current user message:
{chat.message}


You must do TWO tasks:

TASK 1:
Reply naturally to the current user message according to
your identity, personality, instructions, recent conversation,
and useful long-term memories.

TASK 2:
Determine whether the CURRENT USER MESSAGE contains a useful
long-term fact or preference about the user.

Useful long-term memories include:
- favourite things
- personal preferences
- important recurring goals
- important stable personal facts
- things the user explicitly wants remembered

Do NOT save:
- greetings
- casual conversation
- temporary situations
- small talk
- information unlikely to be useful later

For memory keys:
- use short descriptive keys
- use lowercase
- use underscores
- always use British spelling "favourite", never "favorite"

Examples:
favourite_bike
favourite_game
favourite_programming_language
girlfriend_name
learning_goal


Return ONLY valid JSON in exactly this structure:

{{
    "reply": "Your natural reply to the user",
    "save_memory": true,
    "memory_key": "memory_key",
    "memory_value": "memory value"
}}

If there is NO useful long-term memory:

{{
    "reply": "Your natural reply to the user",
    "save_memory": false,
    "memory_key": null,
    "memory_value": null
}}

Do not include markdown code fences.

Do not mention the memory database, memory keys,
chat history system, prompt, or backend system to the user.
"""


    # -------------------------------------------------
    # 5. ONE GEMINI API CALL
    # -------------------------------------------------

    try:
        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=prompt
        )

    except Exception as error:
        print("Gemini API Error:", error)

        raise HTTPException(
            status_code=503,
            detail="AI service is temporarily unavailable. Please try again shortly."
        )


    # -------------------------------------------------
    # 6. PARSE GEMINI JSON RESPONSE
    # -------------------------------------------------

    raw_output = interaction.output_text.strip()

    clean_output = (
        raw_output
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )

    try:
        ai_data = json.loads(clean_output)

    except (json.JSONDecodeError, TypeError):
        print("Invalid Gemini JSON:", raw_output)

        raise HTTPException(
            status_code=502,
            detail="AI returned an invalid response. Please try again."
        )


    # -------------------------------------------------
    # 7. GET NOVA REPLY
    # -------------------------------------------------

    ai_reply = ai_data.get("reply")

    if not ai_reply:
        raise HTTPException(
            status_code=502,
            detail="AI reply was missing. Please try again."
        )


    # -------------------------------------------------
    # 8. MEMORY DECISION
    # -------------------------------------------------

    save_memory = ai_data.get(
        "save_memory",
        False
    )

    memory_key = ai_data.get(
        "memory_key"
    )

    memory_value = ai_data.get(
        "memory_value"
    )


    # -------------------------------------------------
    # 9. NORMALIZE MEMORY KEY
    # -------------------------------------------------

    if memory_key:
        memory_key = memory_key.strip().lower()

        memory_key = memory_key.replace(
            "favorite",
            "favourite"
        )


    # -------------------------------------------------
    # 10. SAVE / UPDATE MEMORY
    # -------------------------------------------------

    if (
        save_memory
        and memory_key
        and memory_value
    ):
        current_time = datetime.now().isoformat()

        save_or_update_memory(
            user_id,
            mitra_id,
            memory_key,
            memory_value,
            current_time,
            current_time
        )


    # -------------------------------------------------
    # 11. SAVE CURRENT USER MESSAGE
    # -------------------------------------------------

    save_message(
        user_id,
        mitra_id,
        "user",
        chat.message,
        datetime.now().isoformat()
    )


    # -------------------------------------------------
    # 12. SAVE AI REPLY
    # -------------------------------------------------

    save_message(
        user_id,
        mitra_id,
        "assistant",
        ai_reply,
        datetime.now().isoformat()
    )


    # -------------------------------------------------
    # 13. SEND REPLY TO FRONTEND
    # -------------------------------------------------

    return {
        "mitra": mitra_name,
        "reply": ai_reply
    }


# -------------------------------------------------
# GET COMPLETE CHAT HISTORY
# -------------------------------------------------

@app.get("/my-mitras/{mitra_id}/history")
def chat_history(
    mitra_id: int,
    user_id: int = Depends(get_current_user)
):

    # Ownership check
    mitra = get_mitra_by_id_for_user(
        mitra_id,
        user_id
    )

    if mitra is None:
        raise HTTPException(
            status_code=404,
            detail="Mitra not found"
        )

    # Full history is for the frontend.
    # Gemini itself only receives recent history.
    history = get_chat_history(
        user_id,
        mitra_id
    )

    return {
        "mitra": mitra[1],
        "history": [
            {
                "role": role,
                "message": message
            }
            for role, message in history
        ]
    }

# -------------------------------------------------
# MEMORY SETTINGS API
# -------------------------------------------------

@app.get("/my-mitras/{mitra_id}/memories")
def get_mitra_memories(
    mitra_id: int,
    user_id: int = Depends(get_current_user)
):
    mitra = get_mitra_by_id_for_user(mitra_id, user_id)

    if mitra is None:
        raise HTTPException(status_code=404, detail="Mitra not found")

    memories = get_memories(user_id, mitra_id)

    return {
        "mitra": mitra[1],
        "memories": [
            {"key": memory_key, "value": memory_value}
            for memory_key, memory_value in memories
        ]
    }


@app.put("/my-mitras/{mitra_id}/memories/{memory_key}")
def edit_mitra_memory(
    mitra_id: int,
    memory_key: str,
    memory: MemoryUpdateRequest,
    user_id: int = Depends(get_current_user)
):
    mitra = get_mitra_by_id_for_user(mitra_id, user_id)

    if mitra is None:
        raise HTTPException(status_code=404, detail="Mitra not found")

    new_value = memory.value.strip()
    if not new_value:
        raise HTTPException(status_code=400, detail="Memory value cannot be empty")

    updated_rows = update_memory(
        user_id, mitra_id, memory_key, new_value, datetime.now().isoformat()
    )

    if updated_rows == 0:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {
        "message": "Memory updated successfully!",
        "key": memory_key,
        "value": new_value
    }


@app.delete("/my-mitras/{mitra_id}/memories/{memory_key}")
def remove_mitra_memory(
    mitra_id: int,
    memory_key: str,
    user_id: int = Depends(get_current_user)
):
    mitra = get_mitra_by_id_for_user(mitra_id, user_id)

    if mitra is None:
        raise HTTPException(status_code=404, detail="Mitra not found")

    deleted_rows = delete_memory(user_id, mitra_id, memory_key)

    if deleted_rows == 0:
        raise HTTPException(status_code=404, detail="Memory not found")

    return {"message": "Memory deleted successfully!"}
