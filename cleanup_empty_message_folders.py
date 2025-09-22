import os
import shutil

MESSAGES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "messages")

def delete_folders_without_json(messages_dir):
    for folder_name in os.listdir(messages_dir):
        folder_path = os.path.join(messages_dir, folder_name)
        if os.path.isdir(folder_path):
            # Check for .json files in the folder
            has_json = any(
                fname.endswith('.json')
                for fname in os.listdir(folder_path)
                if os.path.isfile(os.path.join(folder_path, fname))
            )
            if not has_json:
                print(f"Deleting folder (no JSON found): {folder_path}")
                shutil.rmtree(folder_path)

if __name__ == "__main__":
    delete_folders_without_json(MESSAGES_DIR)
    print("Cleanup complete.")
