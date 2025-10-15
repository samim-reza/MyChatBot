#!/usr/bin/env python3
"""Process personal_info/personal.json and upload into Pinecone namespaces:
   personal, academic, projects, style
"""
import os
import json
from chatbot_setup import PineconeVectorStore, Message, logger

PERSONAL_JSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "personal_info", "personal.json")

def to_messages_for_namespace(namespace, key, value):
	"""Create compact Message objects for a namespace from a key/value."""
	msgs = []
	prefix = f"{key}"
	if isinstance(value, (str, int, float, bool)):
		msgs.append(Message("Samim Reza", f"{prefix}: {value}", f"{namespace}:{key}"))
	elif isinstance(value, dict):
		for k, v in value.items():
			try:
				content = v if isinstance(v, (str, int, float, bool)) else json.dumps(v, ensure_ascii=False)
			except Exception:
				content = str(v)
			msgs.append(Message("Samim Reza", f"{k}: {content}", f"{namespace}:{key}:{k}"))
	elif isinstance(value, list):
		# store each list item as a separate message when appropriate
		for i, item in enumerate(value):
			if isinstance(item, (str, int, float, bool)):
				msgs.append(Message("Samim Reza", f"{prefix}[{i}]: {item}", f"{namespace}:{key}:{i}"))
			elif isinstance(item, dict):
				for k, v in item.items():
					try:
						content = v if isinstance(v, (str, int, float, bool)) else json.dumps(v, ensure_ascii=False)
					except Exception:
						content = str(v)
					msgs.append(Message("Samim Reza", f"{k}: {content}", f"{namespace}:{key}:{i}:{k}"))
			else:
				msgs.append(Message("Samim Reza", f"{prefix}[{i}]: {str(item)}", f"{namespace}:{key}:{i}"))
	else:
		msgs.append(Message("Samim Reza", f"{prefix}: {str(value)}", f"{namespace}:{key}"))
	return msgs

def categorize_personal(data):
	"""Split personal JSON dict into namespace->list of Message objects."""
	namespaces = {
		"personal": [],
		"academic": [],
		"projects": [],
		"style": []
	}
	# personal: basic_identity, family, boundaries
	if "basic_identity" in data:
		for k, v in data["basic_identity"].items():
			namespaces["personal"].extend(to_messages_for_namespace("personal", k, v))
	if "family" in data:
		namespaces["personal"].extend(to_messages_for_namespace("personal", "family", data["family"]))
	if "boundaries" in data:
		namespaces["personal"].extend(to_messages_for_namespace("personal", "boundaries", data["boundaries"]))

	# academic: education, research, competitive_programming, awards, roles, experience
	for key in ["education", "research", "competitive_programming", "awards", "roles", "experience"]:
		if key in data:
			namespaces["academic"].extend(to_messages_for_namespace("academic", key, data[key]))

	# projects
	if "projects" in data:
		namespaces["projects"].extend(to_messages_for_namespace("projects", "projects", data["projects"]))

	# style: preferences.communication_style and other preferences
	if "preferences" in data:
		prefs = data["preferences"]
		# include communication_style under style
		if isinstance(prefs, dict) and "communication_style" in prefs:
			namespaces["style"].extend(to_messages_for_namespace("style", "communication_style", prefs["communication_style"]))
		# also keep other preference summaries under style
		for k, v in prefs.items():
			if k != "communication_style":
				namespaces["style"].extend(to_messages_for_namespace("style", k, v))

	return namespaces

def load_personal_json(path):
	if not os.path.exists(path):
		logger.warning(f"Personal info file not found: {path}")
		return None
	try:
		with open(path, "r", encoding="utf-8") as f:
			return json.load(f)
	except Exception as e:
		logger.error(f"Failed to read {path}: {e}")
		return None

if __name__ == "__main__":
	data = load_personal_json(PERSONAL_JSON)
	if not data:
		logger.info("No personal info found. Exiting.")
		raise SystemExit(0)

	namespaced_messages = categorize_personal(data)

	# Upload each namespace separately
	for namespace, messages in namespaced_messages.items():
		if not messages:
			logger.info(f"No items for namespace '{namespace}', skipping.")
			continue
		logger.info(f"Uploading {len(messages)} items to Pinecone namespace '{namespace}'...")
		store = PineconeVectorStore(namespace=namespace)
		store.add_documents(messages)
		logger.info(f"Uploaded {len(messages)} items to '{namespace}'.")

	logger.info("All personal namespaces processed.")