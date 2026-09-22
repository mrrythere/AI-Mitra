import sqlite3


# ---------------structure-------------------------
# users      👤
# mitras     🤖
# messages   💬
# memories   🧠
# -------------------------------------------------


# -------------------------------------------------
# DATABASE INITIALIZATION
# -------------------------------------------------

connection = sqlite3.connect("ai_mitra.db")

# Enable Foreign Key support in SQLite
connection.execute("PRAGMA foreign_keys = ON")

cursor = connection.cursor()


# -------------------------------------------------
# USERS TABLE
# -------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_login TEXT
)
""")


# -------------------------------------------------
# MITRAS TABLE
# -------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS mitras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    identity TEXT NOT NULL,
    personality TEXT,
    instructions TEXT,

    FOREIGN KEY (user_id) REFERENCES users(id)
)
""")


# -------------------------------------------------
# MESSAGES TABLE
# -------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mitra_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mitra_id) REFERENCES mitras(id)
)
""")


# -------------------------------------------------
# MEMORIES TABLE
# -------------------------------------------------

cursor.execute("""
CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    mitra_id INTEGER NOT NULL,
    memory_key TEXT NOT NULL,
    memory_value TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mitra_id) REFERENCES mitras(id),

    UNIQUE(user_id, mitra_id, memory_key)
)
""")


connection.commit()

print("Database tables created successfully!")

connection.close()


# -------------------------------------------------
# SAVE MITRA
# -------------------------------------------------

def save_mitra(
    user_id,
    name,
    identity,
    personality,
    instructions
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO mitras (
            user_id,
            name,
            identity,
            personality,
            instructions
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            name,
            identity,
            personality,
            instructions
        )
    )

    connection.commit()
    connection.close()


# -------------------------------------------------
# SAVE USER
# -------------------------------------------------

def save_user(
    name,
    email,
    password_hash,
    created_at
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO users (
            name,
            email,
            password_hash,
            created_at
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            email,
            password_hash,
            created_at
        )
    )

    connection.commit()
    connection.close()


# -------------------------------------------------
# GET USER BY EMAIL
# -------------------------------------------------

def get_user_by_email(email):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    user = cursor.fetchone()

    connection.close()

    return user


# -------------------------------------------------
# UPDATE LAST LOGIN
# -------------------------------------------------

def update_last_login(
    email,
    login_time
):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE users
        SET last_login = ?
        WHERE email = ?
        """,
        (
            login_time,
            email
        )
    )

    connection.commit()
    connection.close()


# -------------------------------------------------
# ADMIN USER OVERVIEW
# -------------------------------------------------

def get_admin_user_overview():
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            users.id,
            users.name,
            users.email,
            users.created_at,
            users.last_login,
            mitras.name
        FROM users
        LEFT JOIN mitras
            ON users.id = mitras.user_id
        """
    )

    data = cursor.fetchall()

    connection.close()

    return data


# -------------------------------------------------
# GET USER BY ID
# -------------------------------------------------

def get_user_by_id(user_id):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE id = ?
        """,
        (user_id,)
    )

    user = cursor.fetchone()

    connection.close()

    return user


# -------------------------------------------------
# GET MITRAS BY USER
# -------------------------------------------------

def get_mitras_by_user(user_id):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            identity,
            personality,
            instructions
        FROM mitras
        WHERE user_id = ?
        """,
        (user_id,)
    )

    mitras = cursor.fetchall()

    connection.close()

    return mitras


# -------------------------------------------------
# GET ONE MITRA FOR USER
# -------------------------------------------------

def get_mitra_by_id_for_user(
    mitra_id,
    user_id
):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT
            id,
            name,
            identity,
            personality,
            instructions
        FROM mitras
        WHERE id = ?
        AND user_id = ?
        """,
        (
            mitra_id,
            user_id
        )
    )

    mitra = cursor.fetchone()

    connection.close()

    return mitra


# -------------------------------------------------
# UPDATE MITRA FOR USER
# -------------------------------------------------

def update_mitra_for_user(
    mitra_id,
    user_id,
    name,
    identity,
    personality,
    instructions
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE mitras
        SET
            name = ?,
            identity = ?,
            personality = ?,
            instructions = ?
        WHERE id = ?
        AND user_id = ?
        """,
        (
            name,
            identity,
            personality,
            instructions,
            mitra_id,
            user_id
        )
    )

    updated_rows = cursor.rowcount

    connection.commit()
    connection.close()

    return updated_rows


# -------------------------------------------------
# DELETE MITRA FOR USER
# -------------------------------------------------

def delete_mitra_for_user(
    mitra_id,
    user_id
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    try:
        # First make sure this Mitra actually belongs
        # to the logged-in user.
        cursor.execute(
            """
            SELECT id
            FROM mitras
            WHERE id = ?
            AND user_id = ?
            """,
            (
                mitra_id,
                user_id
            )
        )

        mitra = cursor.fetchone()

        if mitra is None:
            connection.close()
            return 0

        # Delete this Mitra's saved memories first.
        cursor.execute(
            """
            DELETE FROM memories
            WHERE mitra_id = ?
            AND user_id = ?
            """,
            (
                mitra_id,
                user_id
            )
        )

        # Delete this Mitra's chat history.
        cursor.execute(
            """
            DELETE FROM messages
            WHERE mitra_id = ?
            AND user_id = ?
            """,
            (
                mitra_id,
                user_id
            )
        )

        # Now the Mitra can safely be deleted.
        cursor.execute(
            """
            DELETE FROM mitras
            WHERE id = ?
            AND user_id = ?
            """,
            (
                mitra_id,
                user_id
            )
        )

        deleted_rows = cursor.rowcount

        connection.commit()
        connection.close()

        return deleted_rows

    except Exception:
        connection.rollback()
        connection.close()
        raise

# -------------------------------------------------
# SAVE MESSAGE
# -------------------------------------------------

def save_message(
    user_id,
    mitra_id,
    role,
    message,
    created_at
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO messages (
            user_id,
            mitra_id,
            role,
            message,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            user_id,
            mitra_id,
            role,
            message,
            created_at
        )
    )

    connection.commit()
    connection.close()


# -------------------------------------------------
# GET CHAT HISTORY
# -------------------------------------------------

def get_chat_history(
    user_id,
    mitra_id
):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT role, message
        FROM messages
        WHERE user_id = ?
        AND mitra_id = ?
        ORDER BY id ASC
        """,
        (
            user_id,
            mitra_id
        )
    )

    history = cursor.fetchall()

    connection.close()

    return history


# -------------------------------------------------
# SAVE OR UPDATE MEMORY
# -------------------------------------------------

def save_or_update_memory(
    user_id,
    mitra_id,
    memory_key,
    memory_value,
    created_at,
    updated_at
):
    connection = sqlite3.connect("ai_mitra.db")

    connection.execute("PRAGMA foreign_keys = ON")

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT INTO memories (
            user_id,
            mitra_id,
            memory_key,
            memory_value,
            created_at,
            updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)

        ON CONFLICT(user_id, mitra_id, memory_key)
        DO UPDATE SET
            memory_value = excluded.memory_value,
            updated_at = excluded.updated_at
        """,
        (
            user_id,
            mitra_id,
            memory_key,
            memory_value,
            created_at,
            updated_at
        )
    )

    connection.commit()
    connection.close()


# -------------------------------------------------
# GET MEMORIES
# -------------------------------------------------

def get_memories(
    user_id,
    mitra_id
):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT memory_key, memory_value
        FROM memories
        WHERE user_id = ?
        AND mitra_id = ?
        ORDER BY id ASC
        """,
        (
            user_id,
            mitra_id
        )
    )

    memories = cursor.fetchall()

    connection.close()

    return memories

# -------------------------------------------------
# GET RECENT CHAT HISTORY
# -------------------------------------------------

def get_recent_chat_history(
    user_id,
    mitra_id,
    limit=20
):
    connection = sqlite3.connect("ai_mitra.db")

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT role, message
        FROM (
            SELECT id, role, message
            FROM messages
            WHERE user_id = ?
            AND mitra_id = ?
            ORDER BY id DESC
            LIMIT ?
        )
        ORDER BY id ASC
        """,
        (
            user_id,
            mitra_id,
            limit
        )
    )

    history = cursor.fetchall()

    connection.close()

    return history
# -------------------------------------------------
# UPDATE MEMORY
# -------------------------------------------------

def update_memory(
    user_id,
    mitra_id,
    memory_key,
    memory_value,
    updated_at
):
    connection = sqlite3.connect("ai_mitra.db")
    connection.execute("PRAGMA foreign_keys = ON")
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE memories
        SET memory_value = ?, updated_at = ?
        WHERE user_id = ?
        AND mitra_id = ?
        AND memory_key = ?
        """,
        (
            memory_value,
            updated_at,
            user_id,
            mitra_id,
            memory_key
        )
    )

    updated_rows = cursor.rowcount
    connection.commit()
    connection.close()
    return updated_rows


# -------------------------------------------------
# DELETE MEMORY
# -------------------------------------------------

def delete_memory(
    user_id,
    mitra_id,
    memory_key
):
    connection = sqlite3.connect("ai_mitra.db")
    connection.execute("PRAGMA foreign_keys = ON")
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM memories
        WHERE user_id = ?
        AND mitra_id = ?
        AND memory_key = ?
        """,
        (
            user_id,
            mitra_id,
            memory_key
        )
    )

    deleted_rows = cursor.rowcount
    connection.commit()
    connection.close()
    return deleted_rows
