import os
from dotenv import load_dotenv

load_dotenv()

# ===================================================
# Neo4j Configuration 
# ===================================================

NEO4J_URI = "NEO4J_URI"
NEO4J_USERNAME = "neo4j"
NEO4J_PASSWORD = "NEO4J_PASSWORD"
NEO4J_DATABASE = "NEO4J_DATABASE"

# ===================================================
# Hugging Face Configuration 
# ===================================================

HF_TOKEN = os.getenv("HF_TOKEN", "ENTER YOUR KEY")
HF_MODEL = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")

# ===================================================
# Logging Configuration
# ===================================================

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
