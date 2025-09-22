import os
import json

MESSAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages")
YOUR_NAME = "Samim Reza"  # Change if your sender name is different

def process_json_file(json_path, your_name):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    messages = data.get("messages", [])
    table = []

    # Sort messages by timestamp if not already sorted
    messages.sort(key=lambda m: m.get("timestamp_ms", 0))

    i = 0
    while i < len(messages):
        msg = messages[i]
        # If message is received (not sent by you)
        if msg.get("sender_name") != your_name and msg.get("content"):
            received = msg["content"]
            sent = None
            # Find the next message sent by you
            for j in range(i + 1, len(messages)):
                next_msg = messages[j]
                if next_msg.get("sender_name") == your_name and next_msg.get("content"):
                    sent = next_msg["content"]
                    break
            table.append({"received": received, "sent": sent})
        i += 1
    return table

def process_all_message_files(messages_dir, your_name):
    for root, dirs, files in os.walk(messages_dir):
        for file in files:
            if file.endswith(".json") and not file.endswith("_table.json"):
                json_path = os.path.join(root, file)
                table = process_json_file(json_path, your_name)
                out_path = os.path.join(root, file.replace(".json", "_table.json"))
                with open(out_path, "w", encoding="utf-8") as out_f:
                    json.dump(table, out_f, ensure_ascii=False, indent=2)
                print(f"Processed: {json_path} -> {out_path}")

if __name__ == "__main__":
    process_all_message_files(MESSAGES_DIR, YOUR_NAME)
    print("All chat tables extracted.")
