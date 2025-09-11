#!/usr/bin/env python3
"""
Process Facebook messages and personal information for the chatbot.
"""
from chatbot_setup import process_messages
import os
import json
import glob
from chatbot_setup import Message, PineconeVectorStore, logger

def process_personal_info():
    """Process personal information from JSON files."""
    personal_info_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "personal_info")
    
    if not os.path.exists(personal_info_dir):
        print(f"Personal info directory '{personal_info_dir}' not found. Skipping...")
        return []
    
    all_info = []
    
    # Find all JSON files in the personal_info directory
    json_files = []
    for root, dirs, files in os.walk(personal_info_dir):
        for file in files:
            if file.endswith('.json'):
                json_files.append(os.path.join(root, file))
    
    print(f"Found {len(json_files)} personal info JSON files")
    
    # Process each JSON file
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Process personal info based on the file name or structure
            file_name = os.path.basename(json_file)
            
            # Create messages from the personal info
            if isinstance(data, dict):
                # Process each key-value pair as a separate piece of information
                for key, value in data.items():
                    content = f"{key}: {value}" if isinstance(value, (str, int, float, bool)) else f"{key}: {json.dumps(value)}"
                    all_info.append(Message("Samim Reza", content, "Personal Info: " + key))
            elif isinstance(data, list):
                # Process list items
                for item in data:
                    if isinstance(item, dict):
                        # For items with title and content structure
                        if "title" in item and "content" in item:
                            title = item["title"]
                            content = item["content"]
                            # Create a more searchable format
                            message_content = f"INFO - {title}: {content}"
                            all_info.append(Message("Samim Reza", message_content, f"Personal Info: {title}"))
                            
                            # Also add the raw content for better keyword matching
                            all_info.append(Message("Samim Reza", content, f"Personal Info: {title} Content"))
                            
                            # For certain important items, create specific entries for better retrieval
                            if title.lower() in ["portfolio link", "cv link", "links", "contact"]:
                                all_info.append(Message("Samim Reza", f"My {title}: {content}", f"Important Info: {title}"))
                        else:
                            # Process general key-value pairs
                            for key, value in item.items():
                                content = f"{key}: {value}" if isinstance(value, (str, int, float, bool)) else f"{key}: {json.dumps(value)}"
                                all_info.append(Message("Samim Reza", content, f"Personal Info: {key}"))
                    else:
                        all_info.append(Message("Samim Reza", str(item), "Personal Info: General"))
            
            print(f"Processed {json_file}")
            
        except Exception as e:
            print(f"Error processing personal info file {json_file}: {e}")
    
    return all_info

if __name__ == "__main__":
    print("Processing Facebook messages and personal information...")
    
    # Process Facebook messages
    process_messages()
    
    # Process personal information
    personal_info = process_personal_info()
    
    if personal_info:
        print(f"Adding {len(personal_info)} personal info items to vector store...")
        vector_store = PineconeVectorStore(namespace="personal_info")
        vector_store.add_documents(personal_info)
        print(f"Added personal information to vector store.")
    
    print("Done! The chatbot is ready to use.")