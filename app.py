from flask import Flask, request, jsonify, send_file, abort
import os
import logging
import tempfile
from werkzeug.utils import secure_filename
from flask_cors import CORS
from inserter import KnowledgeGraphImporter
from retriver import CodeAnalyzer
from config import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

CORS(app)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_key_replace_in_prod")

# Initialize your custom modules
inserter = KnowledgeGraphImporter(
    NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE
)
analyzer = CodeAnalyzer()

# Allowed file types
ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".java",
    ".cpp",
    ".c",
    ".h",
    ".cs",
    ".rb",
    ".go",
    ".php",
}


def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS


@app.route("/")
def index():
    projects = analyzer.get_all_projects()
    return jsonify(projects)


@app.route("/project/create", methods=["POST"])
def create_project():
    """
    Uploads one or more code files for a project and inserts them into the Neo4j database.
    """
    try:
        project_name = request.form.get("project_name")
        if not project_name:
            return jsonify({"message": "Project name is required"}), 400

        # Check if the project already exists
        projects = analyzer.get_all_projects()
        if project_name in projects:
            return jsonify({"message": "Project name already exists"}), 400

        # Create/Set the project in your knowledge graph
        inserter.set_project(project_name)

        # Retrieve uploaded files
        files = request.files.getlist("files")
        if not files:
            return jsonify({"message": "Files are required"}), 400

        for file in files:
            if file and allowed_file(file.filename):
                file_name = secure_filename(file.filename)
                # Save file temporarily
                file_path = os.path.join(tempfile.gettempdir(), file_name)
                file.save(file_path)
                # Import file content into Neo4j
                inserter.import_data(file_path)
                # Remove the temporary file
                os.remove(file_path)
            else:
                return jsonify({"message": "Invalid file type"}), 400

        return jsonify({"message": "Project created successfully"}), 200
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        return jsonify({"message": "Internal server error"}), 500


@app.route("/project/<project_name>")
def project_analysis(project_name):
    """
    Retrieves code for the given project, performs analysis using the LLM, and returns the documentation.
    """
    try:
        code_content = analyzer.retrieve_code(project_name)
        if not code_content:
            return jsonify({"message": "Project not found"}), 404

        analysis = analyzer.perform_analysis(code_content)
        return jsonify({"analysis": analysis})
    except Exception as e:
        logger.error(f"Error analyzing project: {e}")
        return jsonify({"message": "Internal server error"}), 500


@app.route("/project/<project_name>/<question>")
def project_question(project_name, question):
    """
    Retrieves code for the project, generates documentation, and answers a user-provided question.
    """
    try:
        code_content = analyzer.retrieve_code(project_name)
        if not code_content:
            return jsonify({"message": "Project not found"}), 404

        # Generate documentation from the code
        documentation = analyzer.perform_analysis(code_content)
        answer = analyzer.answer_question(documentation, question)
        return jsonify({"answer": answer})
    except Exception as e:
        logger.error(f"Error answering question: {e}")
        return jsonify({"message": "Internal server error"}), 500


@app.route("/project/<project_name>/report")
def project_report(project_name):
    """
    Generates a PDF report for the project analysis and returns the file.
    """
    try:
        # Validate project exists by retrieving its code
        code_content = analyzer.retrieve_code(project_name)
        if not code_content:
            return jsonify({"message": "Project not found"}), 404

        report = analyzer.generate_pdf(project_name)
        return send_file(report, as_attachment=True)
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({"message": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True)
