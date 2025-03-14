import os
import glob
import re
import logging
from neo4j import GraphDatabase, RoutingControl
from neo4j.exceptions import DriverError, Neo4jError
from config import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD, NEO4J_DATABASE

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class KnowledgeGraphImporter:
    def __init__(self, uri, username, password, database):
        """
        Initializes the KnowledgeGraphImporter with connection details.
        Also initializes a dictionary to store extracted metadata for each file.
        """
        self.uri = uri
        self.username = username
        self.password = password
        self.database = database
        self.driver = GraphDatabase.driver(uri, auth=(username, password))
        self.project_name = None  # Will hold the main node name (Project)
        # Data structure for cross-file analysis:
        # { file_path: { "filename": ..., "functions": [{"name": ..., "code": ...}, ...],
        #                "function_calls": [...], "packages": [...], "language": ... } }
        self.imported_data = {}

    # Include all other methods from the original file
    def close(self):
        """Closes the connection to Neo4j."""
        if self.driver:
            self.driver.close()
            logger.info("Closed Neo4j connection.")

    def connect(self):
        """Verifies connectivity to the Neo4j graph database."""
        try:
            self.driver.verify_connectivity()
            logger.info("Successfully connected to Neo4j.")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j: {e}")
            raise

    def set_project(self, project_name):
        """Sets the project (main node) name and creates a Project node in Neo4j."""
        self.project_name = project_name
        query = "MERGE (p:Project {name: $project_name}) RETURN p"
        try:
            self.driver.execute_query(
                query, project_name=project_name, database_=self.database
            )
            logger.info(f"Created/updated Project node: {project_name}")
        except Exception as e:
            logger.error(f"Error creating Project node {project_name}: {e}")
            raise

    def import_data(self, file_path):
        """
        Imports data from a single file:
        - Reads file content.
        - Detects language.
        - Extracts functions (with full code), package statements, and function calls.
        - Creates corresponding nodes and relationships in Neo4j.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception as e:
            logger.error(f"Error reading {file_path}: {e}")
            return

        filename = os.path.basename(file_path)
        ext = os.path.splitext(file_path)[1].lower()
        language = self.detect_language(ext)

        # Extract information using language-specific or generic methods
        functions = self.extract_functions(content, ext)
        packages = self.extract_packages(content, ext)
        # For function calls, extract all words followed by '(' and remove those defined in the same file.
        function_calls = self.extract_function_calls(
            content, [func["name"] for func in functions]
        )

        # Create File node with properties (and attach to the Project node if set)
        self.create_file_node(filename, file_path, content, language)

        # Create Function nodes (with full code) and link them to the File node
        for func in functions:
            self.create_function_node(file_path, func)

        # Create Package nodes and link them to the File node
        for pkg in packages:
            self.create_package_node(file_path, pkg)

        # Save the extracted data locally for creating cross-file relationships later
        self.imported_data[file_path] = {
            "filename": filename,
            "functions": functions,
            "function_calls": function_calls,
            "packages": packages,
            "language": language,
        }

        logger.info(f"Imported data from file: {file_path}")

    def detect_language(self, ext):
        """Detects the programming language based on file extension."""
        mapping = {
            ".py": "Python",
            ".cs": "C#",
            ".java": "Java",
            ".js": "JavaScript",
            ".ts": "TypeScript",
            ".cpp": "C++",
            ".c": "C",
            ".h": "C/C++ Header",
            ".rb": "Ruby",
            ".go": "Go",
            ".php": "PHP",
        }
        return mapping.get(ext, "Unknown")

    def extract_functions(self, content, ext):
        """Chooses the appropriate function extraction method based on the file extension."""
        if ext == ".py":
            return self.extract_python_functions(content)
        elif ext == ".cs":
            return self.extract_cs_functions(content)
        elif ext == ".java":
            return self.extract_java_functions(content)
        elif ext in [".js", ".ts"]:
            return self.extract_javascript_functions(content)
        elif ext in [".cpp", ".c", ".h"]:
            return self.extract_cpp_functions(content)
        else:
            return self.extract_generic_functions(content)

    def extract_python_functions(self, content):
        """Extracts Python functions (name and code) using indentation."""
        functions = []
        lines = content.splitlines()
        i = 0
        while i < len(lines):
            line = lines[i]
            stripped_line = line.lstrip()
            if stripped_line.startswith("def "):
                func_name_match = re.match(r"def\s+(\w+)\s*\(", stripped_line)
                if not func_name_match:
                    i += 1
                    continue
                func_name = func_name_match.group(1)
                function_lines = [line]
                i += 1
                base_indent = len(line) - len(stripped_line)
                while i < len(lines):
                    next_line = lines[i]
                    if next_line.strip() == "":
                        function_lines.append(next_line)
                        i += 1
                        continue
                    current_indent = len(next_line) - len(next_line.lstrip())
                    if current_indent > base_indent:
                        function_lines.append(next_line)
                        i += 1
                    else:
                        break
                function_code = "\n".join(function_lines)
                functions.append({"name": func_name, "code": function_code})
            else:
                i += 1
        return functions

    def extract_cs_functions(self, content):
        """Extracts C# functions using a regex and brace-matching."""
        functions = []
        pattern = re.compile(
            r"(public|private|protected)\s+(static\s+)?\S+\s+(\w+)\s*\([^)]*\)\s*{"
        )
        for match in pattern.finditer(content):
            func_name = match.group(3)
            i = match.end() - 1
            brace_count = 1
            while i < len(content) and brace_count > 0:
                i += 1
                if i >= len(content):
                    break
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
            function_code = (
                content[match.start() : i + 1]
                if i < len(content)
                else content[match.start() :]
            )
            functions.append({"name": func_name, "code": function_code})
        return functions

    def extract_java_functions(self, content):
        """Extracts Java methods using a regex and brace matching."""
        functions = []
        pattern = re.compile(
            r"(public|private|protected)\s+(static\s+)?\S+\s+(\w+)\s*\([^)]*\)\s*{"
        )
        for match in pattern.finditer(content):
            func_name = match.group(3)
            i = match.end() - 1
            brace_count = 1
            while i < len(content) and brace_count > 0:
                i += 1
                if i >= len(content):
                    break
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
            function_code = (
                content[match.start() : i + 1]
                if i < len(content)
                else content[match.start() :]
            )
            functions.append({"name": func_name, "code": function_code})
        return functions

    def extract_javascript_functions(self, content):
        """Extracts JavaScript/TypeScript functions declared with the 'function' keyword."""
        functions = []
        pattern = re.compile(r"function\s+(\w+)\s*\([^)]*\)\s*{")
        for match in pattern.finditer(content):
            func_name = match.group(1)
            i = match.end() - 1
            brace_count = 1
            while i < len(content) and brace_count > 0:
                i += 1
                if i >= len(content):
                    break
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
            function_code = (
                content[match.start() : i + 1]
                if i < len(content)
                else content[match.start() :]
            )
            functions.append({"name": func_name, "code": function_code})
        return functions

    def extract_cpp_functions(self, content):
        """Extracts C/C++ functions using a generic regex and brace matching."""
        functions = []
        pattern = re.compile(r"(?:[\w:\*&<>\s]+)\s+(\w+)\s*\([^)]*\)\s*{")
        for match in pattern.finditer(content):
            func_name = match.group(1)
            i = match.end() - 1
            brace_count = 1
            while i < len(content) and brace_count > 0:
                i += 1
                if i >= len(content):
                    break
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
            function_code = (
                content[match.start() : i + 1]
                if i < len(content)
                else content[match.start() :]
            )
            functions.append({"name": func_name, "code": function_code})
        return functions

    def extract_generic_functions(self, content):
        """Fallback extractor for functions using a generic pattern."""
        functions = []
        pattern = re.compile(r"function\s+(\w+)\s*\([^)]*\)\s*{")
        for match in pattern.finditer(content):
            func_name = match.group(1)
            i = match.end() - 1
            brace_count = 1
            while i < len(content) and brace_count > 0:
                i += 1
                if i >= len(content):
                    break
                if content[i] == "{":
                    brace_count += 1
                elif content[i] == "}":
                    brace_count -= 1
            function_code = (
                content[match.start() : i + 1]
                if i < len(content)
                else content[match.start() :]
            )
            functions.append({"name": func_name, "code": function_code})
        return functions

    def extract_packages(self, content, ext):
        """Extracts package or module dependencies from the content."""
        packages = set()
        if ext == ".py":
            import_pattern = r"^\s*import\s+(\w+)"
            from_pattern = r"^\s*from\s+(\w+)"
            packages.update(re.findall(import_pattern, content, re.MULTILINE))
            packages.update(re.findall(from_pattern, content, re.MULTILINE))
        elif ext == ".cs":
            pattern = r"^\s*using\s+([\w\.]+)\s*;"
            packages.update(re.findall(pattern, content, re.MULTILINE))
        elif ext == ".java":
            pattern = r"^\s*import\s+([\w\.]+)\s*;"
            packages.update(re.findall(pattern, content, re.MULTILINE))
        elif ext in [".js", ".ts"]:
            import_pattern = r'^\s*import\s+.*\s+from\s+[\'"]([\w\/\.-]+)[\'"]'
            packages.update(re.findall(import_pattern, content, re.MULTILINE))
            require_pattern = r'require\([\'"]([\w\/\.-]+)[\'"]\)'
            packages.update(re.findall(require_pattern, content))
        elif ext in [".cpp", ".c", ".h"]:
            pattern = r'^\s*#include\s+[<"]([\w\.\/]+)[>"]'
            packages.update(re.findall(pattern, content, re.MULTILINE))
        return list(packages)

    def extract_function_calls(self, content, defined_functions):
        """Extracts function calls by finding words immediately followed by an opening parenthesis."""
        all_calls = re.findall(r"(\w+)\s*\(", content)
        calls = [call for call in all_calls if call not in defined_functions]
        return list(set(calls))

    def create_file_node(self, filename, file_path, content, language):
        """
        Creates or updates a File node in Neo4j with the given properties.
        Also creates a relationship from the Project node to this File node (if a project is set).
        """
        query = (
            "MERGE (f:File {path: $file_path}) "
            "SET f.filename = $filename, f.content = $content, f.language = $language "
            "WITH f "
            "OPTIONAL MATCH (p:Project {name: $project_name}) "
            "FOREACH (ignoreMe IN CASE WHEN p IS NULL THEN [] ELSE [1] END | "
            "   MERGE (p)-[:CONTAINS_FILE]->(f) )"
        )
        try:
            self.driver.execute_query(
                query,
                filename=filename,
                file_path=file_path,
                content=content,
                language=language,
                project_name=self.project_name,
                database_=self.database,
            )
            logger.info(f"Created/updated File node: {filename}")
        except Exception as e:
            logger.error(f"Error creating File node for {filename}: {e}")

    def create_function_node(self, file_path, function):
        """
        Creates a Function node (with name and code) and links it to the corresponding File node.
        """
        function_name = function["name"]
        function_code = function["code"]
        query = (
            "MATCH (f:File {path: $file_path}) "
            "MERGE (fn:Function {name: $function_name, file: $file_path}) "
            "SET fn.code = $function_code "
            "MERGE (f)-[:CONTAINS_FUNCTION]->(fn)"
        )
        try:
            self.driver.execute_query(
                query,
                file_path=file_path,
                function_name=function_name,
                function_code=function_code,
                database_=self.database,
            )
            logger.info(f"Created Function node: {function_name} in {file_path}")
        except Exception as e:
            logger.error(
                f"Error creating Function node {function_name} in {file_path}: {e}"
            )

    def create_package_node(self, file_path, package_name):
        """
        Creates a Package node and links it to the corresponding File node.
        """
        query = (
            "MATCH (f:File {path: $file_path}) "
            "MERGE (p:Package {name: $package_name}) "
            "MERGE (f)-[:USES_PACKAGE]->(p)"
        )
        try:
            self.driver.execute_query(
                query,
                file_path=file_path,
                package_name=package_name,
                database_=self.database,
            )
            logger.info(f"Created Package node: {package_name} for {file_path}")
        except Exception as e:
            logger.error(
                f"Error creating Package node {package_name} for {file_path}: {e}"
            )

    def create_file_relationship(self, from_path, to_path, function_name):
        """
        Creates a relationship between two File nodes indicating that
        a function call in the first file refers to a function defined in the second file.
        """
        query = (
            "MATCH (f1:File {path: $from_path}), (f2:File {path: $to_path}) "
            "MERGE (f1)-[:CALLS {function: $function_name}]->(f2)"
        )
        try:
            self.driver.execute_query(
                query,
                from_path=from_path,
                to_path=to_path,
                function_name=function_name,
                database_=self.database,
            )
            logger.info(
                f"Created CALLS relationship from {from_path} to {to_path} for function {function_name}"
            )
        except Exception as e:
            logger.error(
                f"Error creating CALLS relationship from {from_path} to {to_path} for function {function_name}: {e}"
            )

    def process_directory(self, directory_path):
        """
        Recursively processes all files in the given directory.
        After importing individual files, it creates cross-file relationships based on function calls.
        """
        files = glob.glob(os.path.join(directory_path, "**/*"), recursive=True)
        for file_path in files:
            if os.path.isfile(file_path):
                self.import_data(file_path)
            else:
                logger.warning(f"Skipped non-file: {file_path}")
        # Create inter-file relationships based on function calls.
        self.process_function_relationships()

    def process_function_relationships(self):
        """
        Iterates through the imported data and creates a relationship between files
        when a function call in one file refers to a function defined in another file.
        """
        file_paths = list(self.imported_data.keys())
        for file_a in file_paths:
            calls = self.imported_data[file_a].get("function_calls", [])
            for func in calls:
                for file_b in file_paths:
                    if file_a == file_b:
                        continue
                    defined_funcs = [
                        f["name"]
                        for f in self.imported_data[file_b].get("functions", [])
                    ]
                    if func in defined_funcs:
                        self.create_file_relationship(file_a, file_b, func)

    def execute_query(self, query, **kwargs):
        """
        Executes a custom query with parameters.
        """
        try:
            self.driver.execute_query(query, **kwargs)
            logger.info(f"Executed custom query: {query}")
        except Exception as e:
            logger.error(f"Error executing custom query: {e}")

    def delete_all(self):
        """
        Deletes all nodes and relationships from the graph database.
        """
        query = "MATCH (n) DETACH DELETE n"
        try:
            self.driver.execute_query(query)
            logger.info("Deleted all nodes and relationships.")
        except Exception as e:
            logger.error(f"Error deleting all nodes and relationships: {e}")

    def delete_project(self):
        """
        Deletes all nodes and relationships related to the current project.
        """
        query = "MATCH (p:Project {name: $project_name}) DETACH DELETE p"
        try:
            self.driver.execute_query(query, project_name=self.project_name)
            logger.info(f"Deleted project {self.project_name}")
        except Exception as e:
            logger.error(f"Error deleting project {self.project_name}: {e}")
