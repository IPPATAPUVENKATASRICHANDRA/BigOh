import logging
import time
from neo4j import GraphDatabase
from neo4j.exceptions import Neo4jError
from huggingface_hub import InferenceClient
from fpdf import FPDF
from config import (
    NEO4J_URI,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
    NEO4J_DATABASE,
    HF_TOKEN,
    HF_MODEL,
)

logger = logging.getLogger(__name__)


class CodeAnalyzer:
    def __init__(self):
        """Initialize Neo4j and Hugging Face client."""
        self.driver = GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
        )
        self.llm_client = InferenceClient(model=HF_MODEL, token=HF_TOKEN)
        self.conversation_history = ""  # Stores Q&A history
        self.analysis = None  # Stores the analysis result

    def close(self):
        """Closes the Neo4j connection."""
        if self.driver:
            self.driver.close()
            logger.info("Closed Neo4j connection.")

    def get_all_projects(self):
        """Retrieve all project names from the database."""
        query = "MATCH (p:Project) RETURN p.name AS name"
        projects = []
        try:
            with self.driver.session(database=NEO4J_DATABASE) as session:
                result = session.run(query)
                projects = [record["name"] for record in result]
            return projects
        except Exception as e:
            logger.error(f"Error retrieving projects from Neo4j: {e}")
            return []

    def retrieve_code(self, project_name):
        """Retrieve all code files linked to a project from Neo4j."""
        query = """
        MATCH (p:Project {name: $project_name})-[:CONTAINS_FILE]->(f:File)
        RETURN f.content AS content
        """
        try:
            with self.driver.session(database=NEO4J_DATABASE) as session:
                result = session.run(query, project_name=project_name)
                code_snippets = [record["content"] for record in result]
            return "\n\n".join(code_snippets) if code_snippets else None
        except Exception as e:
            logger.error(f"Error retrieving code from Neo4j: {e}")
            return None

    def perform_analysis(self, content):
        """Generates full documentation for the code using LLM."""
        prompt = (
            f"Analyze the following code and provide insights:\n\n{content}\n\n"
            "Provide a detailed breakdown including:\n"
            "- Code structure\n"
            "- Potential issues and improvements\n"
            "- Functionality and purpose of key components\n"
            "- Detailed explanation of each function and module\n"
            "- Security concerns, performance optimizations, and best practices\n"
            "Provide the response in a well-structured documentation format."
        )
        retries = 3
        delay = 10
        for attempt in range(retries):
            try:
                logger.info(f"Attempt {attempt + 1} to generate insights...")
                response = self.llm_client.text_generation(prompt, max_new_tokens=10000)
                insights = (
                    response
                    if isinstance(response, str)
                    else response.get("generated_text", "")
                )
                self.analysis = insights.strip()  # Store analysis result separately
                return self.analysis
            except Exception as e:
                logger.error(f"Error generating insights: {e}")
                if attempt < retries - 1:
                    logger.info(f"Retrying in {delay} seconds...")
                    time.sleep(delay)
                    delay *= 2
                else:
                    self.analysis = (
                        "⚠️ Failed to generate insights after multiple attempts."
                    )
                    return self.analysis

    def answer_question(self, documentation, question):
        """Generates an answer for a given question based on the provided documentation."""
        prompt = (
            f"Based on the following code documentation:\n\n{documentation}\n\n"
            f"Answer the user's question: {question}"
        )
        try:
            response = self.llm_client.text_generation(prompt, max_new_tokens=1500)
            answer = (
                response
                if isinstance(response, str)
                else response.get("generated_text", "")
            )
            # Remove extra leading/trailing whitespace
            answer = answer.strip()
            # Update conversation history with formatted Q&A
            self.conversation_history += f"\nUser: {question}\nAI:\n{answer}\n"
            return answer
        except Exception as e:
            logger.error(f"Error responding to query: {e}")
            return "⚠️ Sorry, I couldn't process your question."

    def generate_pdf(self, project_name):
        """Generates a PDF file with the analysis and conversation history."""
        pdf = FPDF()
        pdf.add_page()
        pdf.set_auto_page_break(auto=True, margin=15)

        # Header
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_text_color(0, 102, 204)  # Set header text color to a nice blue
        pdf.cell(0, 10, f"Code Analysis Report for Project: {project_name}", 0, 1, "C")
        pdf.ln(10)

        # Analysis Section
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(0, 0, 0)  # Set text color to black
        if self.analysis:
            pdf.multi_cell(0, 10, self.analysis)
            pdf.ln(10)

        # Conversation History Section
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(0, 102, 204)  # Set section header color to blue
        pdf.cell(0, 10, "Conversation History", 0, 1, "L")
        pdf.ln(5)
        pdf.set_font("Helvetica", "", 12)
        pdf.set_text_color(0, 0, 0)  # Set text color to black
        pdf.multi_cell(0, 10, self.conversation_history)
        pdf.ln(10)

        # Footer
        pdf.set_y(-15)
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(128, 128, 128)  # Set footer text color to gray
        pdf.cell(0, 10, "Developed by BigOh!", 0, 0, "C")

        output_filename = f"{project_name}_analysis_report.pdf"
        pdf.output(output_filename)
        return output_filename
