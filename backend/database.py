import os
from contextlib import contextmanager
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

# Resolve project root so .env loads when running from the backend package
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env")

# Database configuration
POOL_MODE = os.getenv("POOL_MODE", "session").lower()


def _default_port_for_pool_mode() -> str:
    """Return Supabase pooler port based on pool mode."""
    if POOL_MODE == "transaction":
        return "6543"
    return "5432"


DB_CONFIG = {
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST", "db.mqsjbkczzqbqydogynug.supabase.co"),
    "port": os.getenv("DB_PORT", _default_port_for_pool_mode()),
    "dbname": os.getenv("DB_NAME", "postgres"),
    # Supabase Postgres requires TLS; leave overridable via env if needed
    "sslmode": os.getenv("DB_SSLMODE", "require"),
}


@contextmanager
def get_db_connection():
    """Context manager for database connections with cleanup."""
    connection = None
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        yield connection
    except Exception as e:
        if connection:
            connection.rollback()
        raise e
    finally:
        if connection:
            connection.close()


def test_connection():
    """Test database connection."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT NOW();")
            result = cursor.fetchone()
            print("✅ Database connection successful!")
            print(f"Current Time: {result[0]}")
            cursor.close()
            return True
    except Exception as e:
        print(f"❌ Failed to connect to database: {e}")
        return False


def execute_query(query: str, params: tuple = None, fetch: bool = True):
    """Execute a SQL query with optional parameters."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            cursor.execute(query, params)

            if fetch:
                results = cursor.fetchall()
                cursor.close()
                return results
            conn.commit()
            cursor.close()
            return None

    except Exception as e:
        print(f"Query execution failed: {e}")
        raise e


if __name__ == "__main__":
    # Test the connection when running this file directly
    test_connection()
