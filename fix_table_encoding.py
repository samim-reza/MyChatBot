import os
import json

MESSAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages")

def decode_text(text):
    if text is None:
        return None
    # Decode escaped unicode (e.g. "\u09b8\u09be\u09b2\u09be\u09ae" or "à¦à§à¦¾...")
    try:
        # First, encode to bytes using 'latin1', then decode as 'utf-8'
        return text.encode('latin1').decode('utf-8')
    except Exception:
        # If decoding fails, return original
        return text

def fix_table_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        table = json.load(f)
    for row in table:
        row["received"] = decode_text(row.get("received"))
        row["sent"] = decode_text(row.get("sent"))
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(table, f, ensure_ascii=False, indent=2)
    print(f"Fixed encoding: {filepath}")

def process_all_tables(messages_dir):
    for root, dirs, files in os.walk(messages_dir):
        for file in files:
            if file == "message_1_table.json":
                fix_table_file(os.path.join(root, file))

if __name__ == "__main__":
    process_all_tables(MESSAGES_DIR)
    print("All table files encoding fixed.")
