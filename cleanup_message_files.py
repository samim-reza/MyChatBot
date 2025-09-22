import os

MESSAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages")
KEEP_FILES = {"message_1.json", "message_1_table.json"}

def cleanup_message_folders(messages_dir):
    for folder_name in os.listdir(messages_dir):
        folder_path = os.path.join(messages_dir, folder_name)
        if os.path.isdir(folder_path):
            for fname in os.listdir(folder_path):
                if fname not in KEEP_FILES:
                    file_path = os.path.join(folder_path, fname)
                    if os.path.isfile(file_path):
                        print(f"Deleting file: {file_path}")
                        os.remove(file_path)

if __name__ == "__main__":
    cleanup_message_folders(MESSAGES_DIR)
    print("Cleanup complete: Only message_1.json and message_1_table.json kept in each folder.")
