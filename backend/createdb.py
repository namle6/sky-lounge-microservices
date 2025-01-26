import sqlite3
import os

DB_FILE = "mydatabase.db"
SQL_FILE = "schema.sql"  # your external file with all create/insert statements


def create_database(db_path, sql_path):
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")

    conn = sqlite3.connect(db_path)

    with open(sql_path, "r", encoding="utf-8") as f:
        sql_script = f.read()

    # Execute the entire SQL script
    conn.executescript(sql_script)
    conn.commit()
    conn.close()
    print(f"Created new database from {sql_path} -> {db_path}")


if __name__ == "__main__":
    create_database(DB_FILE, SQL_FILE)
