import os
from dotenv import load_dotenv
load_dotenv()

uri = os.environ.get("NEO4J_URI") or os.environ.get("NEO4J_URL")
user = os.environ.get("NEO4J_USERNAME") or os.environ.get("NEO4J_USER")
password = os.environ.get("NEO4J_PASSWORD")

# Strict debug print to capture application runtime variables
if not all([uri, user, password]):
    print(f"--- APP DB DEBUG --- URI: {uri}, USER: {user}, PASS_EXISTS: {password is not None}")
    print("[neo4j] Missing credentials — running without graph context.")
    driver = None
    