import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css'; // Import the CSS file

// API URL - change to your production URL when deploying
const API_URL = 'http://localhost:5000';


// function App() {
//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>Big Oh!</h1>
//       </header>
//       <main className="app-content">
//         <Routes>
//           {/* The home route now shows both the project list and the About Us section */}
//           <Route path="/" element={<Home />} />
//           <Route path="/about_us" element={<AboutUs />} />
//           <Route path="/create" element={<CreateProject />} />
//           <Route path="/project/:projectName" element={<ProjectDetails />} />
//           <Route path="/project/:projectName/ask" element={<AskQuestion />} />
//         </Routes>
//       </main>
//       <footer className="app-footer">
//         <p>&copy; {new Date().getFullYear()} Big Oh!</p>
//       </footer>
//     </div>
//   );
// }
// // Home component: Combines the project list and About Us sections
// function Home() {
//   return (
//     <div>
//       <ProjectList />
//       <AboutUs />
//     </div>
//   );
// }

// function AboutUs() {
//   // Use the correct relative path for an image in the public folder.
//   const imagePath = "/bigoh_favicon.ico";

//   return (
//     <div className="about-us-container">
//       <div className="page-header">
//         <h2>About Us</h2>
//         <Link to="/" className="btn btn-text">
//           <i className="fas fa-arrow-left"></i> Back to Projects
//         </Link>
//       </div>
      
//       <div className="about-content">
//         {/* Image Section */}
//         <div className="about-image">
//           <img src={imagePath} alt="Big Oh! Logo" />
//         </div>

//         {/* Details Section */}
//         <div className="about-details">
//           {/* Project About */}
//           <section className="project-about">
//             <h3>What is Big Oh! Project?</h3>
//             <p>
//               Big Oh! is a project that helps you analyze the complexity of your code and provides insights on how to optimize it.
//             </p>
//           </section>

//           {/* Tech Stack */}
//           <section className="tech-stack">
//             <h3>Tech Stack Used</h3>
//             <ul>
//               <li>Python</li>
//               <li>Flask</li>
//               <li>React</li>
//               <li>Bootstrap</li>
//             </ul>
//           </section>

//           {/* Contact Us */}
//           <section className="contact-us">
//             <h3>Contact Us</h3>
//             <p>
//               <strong>Author:</strong> I.V.SRICHANDRA
//             </p>
//             <p>
//               <strong>Email:</strong> example@example.com
//             </p>
//             <p>
//               <strong>GitHub:</strong>{" "}
//               <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer">
//                 GitHub Profile
//               </a>
//             </p>
//           </section>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Project list function to show all the project list to the user
// function ProjectList() {
//   const [projects, setProjects] = useState([]);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   // Function to fetch projects
//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${API_URL}/`);
//       setProjects(response.data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="project-list-container">
//       <div className="page-header">
//         <h2>My Projects</h2>
//         <button 
//           className="btn btn-primary" 
//           onClick={() => navigate('/create')}
//         >
//           <i className="fas fa-plus"></i> New Project
//         </button>
//       </div>
      
//       {loading && <div className="loading-spinner"></div>}
      
//       {error && (
//         <div className="alert alert-danger">
//           <strong>Error:</strong> {error}
//         </div>
//       )}
      
//       {!loading && projects.length === 0 && !error && (
//         <div className="empty-state">
//           <i className="fas fa-folder-open empty-icon"></i>
//           <p>No projects found. Create your first project!</p>
//           <button 
//             className="btn btn-primary" 
//             onClick={() => navigate('/create')}
//           >
//             Create New Project
//           </button>
//         </div>
//       )}
      
//       {projects.length > 0 && (
//         <div className="project-cards">
//           {projects.map((project) => (
//             <div className="project-card" key={project} onClick={() => navigate(`/project/${project}`)}>
//               <div className="project-card-header">
//                 <i className="fas fa-code"></i>
//                 <h3>{project}</h3>
//               </div>
//               <div className="project-card-actions">
//                 <button 
//                   className="btn btn-sm btn-outline" 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate(`/project/${project}`);
//                   }}
//                 >
//                   View Details
//                 </button>
//                 <button 
//                   className="btn btn-sm btn-outline" 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate(`/project/${project}/ask`);
//                   }}
//                 >
//                   Ask Question
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Big Oh!</h1>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/create" element={<CreateProject />} />
          <Route path="/project/:projectName" element={<ProjectDetails />} />
          <Route path="/project/:projectName/ask" element={<AskQuestion />} />
          {/* Default route */}
          <Route path="/" element={<AboutUs />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Big Oh!</p>
      </footer>
    </div>
  );
}

// ========================================== About us ==============================================

function AboutUs() {
  const navigate = useNavigate();
  // Use a relative path for an image placed in the public folder
  const imagePath = "/bigoh_favicon.ico";

  return (
    <div className="about-us-container">
      <div className="page-header">
        <h2>About Big Oh! 🚀</h2>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            <i className="fas fa-plus"></i> Create Project
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
            <i className="fas fa-folder"></i> Project List
          </button>
        </div>
      </div>

      <div className="about-content">
        {/* Image Section */}
        <div className="about-image">
          <img src={imagePath} alt="Big Oh! Logo" />
        </div>

        {/* Expanded Details Section */}
        <div className="about-details">
          <section className="project-about">
            <h3>What is Big Oh! Project? 🤔</h3>
            <p>
              Big Oh! is a groundbreaking tool designed to unlock the hidden insights of your code. By uploading one or multiple code files,
              the project takes your input and creates a dynamic knowledge graph where every package, function, and module is represented as a node.
              This visual representation helps you understand the complexity of your code and highlights areas ripe for optimization.
            </p>
          </section>

          <section className="project-utility">
            <h3>How is it Useful? 💡</h3>
            <p>
              Imagine having a smart assistant that can break down your project into its fundamental parts and reveal how they interconnect. Big Oh! makes it easy to:
            </p>
            <ul>
              <li>Visualize your code structure with clarity</li>
              <li>Identify potential bottlenecks and complexity hotspots</li>
              <li>Optimize and refactor with confidence</li>
              <li>Generate detailed reports for better collaboration and understanding</li>
            </ul>
            <p>
              It’s like having a code whisperer that explains your project inside out, making maintenance and scaling a breeze!
            </p>
          </section>

          <section className="project-users">
            <h3>Who Can Use It? 👩‍💻👨‍💻</h3>
            <p>
              Big Oh! is crafted for anyone who wants deeper insights into their code:
            </p>
            <ul>
              <li><strong>Individual Developers:</strong> Enhance your coding practice with detailed visual analysis.</li>
              <li><strong>Development Teams:</strong> Streamline collaboration with clear, shareable reports.</li>
              <li><strong>Code Reviewers & Architects:</strong> Dive into the nuances of project architecture.</li>
              <li><strong>Students & Educators:</strong> Demystify complex code structures and learn best practices.</li>
            </ul>
          </section>

          <section className="tech-stack">
            <h3>Tech Stack Used 🛠️</h3>
            <p>
              Big Oh! is built on a modern and robust technology stack that ensures performance and scalability:
            </p>
            <ul>
              <li><strong>Python:</strong> Powers our code analysis engine.</li>
              <li><strong>Flask:</strong> Provides a lightweight and efficient backend.</li>
              <li><strong>React:</strong> Delivers a dynamic and responsive user interface.</li>
              <li><strong>Neo4j:</strong> Manages and stores our knowledge graph data seamlessly.</li>
            </ul>
          </section>

          <section className="contact-us">
            <h3>Contact Us 📬</h3>
            <p>

              <strong>Author:</strong> I.V.SRICHANDRA
            </p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:ippatapuvenkatasrichandra@gmail.com">
                ippatapuvenkatasrichandra@gmail.com
              </a>
            </p>
            <p>
              <strong>GitHub:</strong>{' '}
              <a href="https://github.com/IPPATAPUVENKATASRICHANDRA" target="_blank" rel="noopener noreferrer">
                GitHub Profile
              </a>
            </p>
            <p>
              Whether you have feedback, ideas for collaboration, or just want to chat about coding, feel free to reach out anytime! 😃
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ================================== Project list ===========================================================
function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/`);
      setProjects(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-list-container">
      <div className="page-header">
        <h2>My Projects 📁</h2>
        <div className="header-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/about_us')}>
            <i className="fas fa-arrow-left"></i> 🔙 Back
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-container" style={{ display: 'flex', alignItems: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5em', marginRight: '8px' }}></i>
          <span>Loading... ⏳</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          <strong>Error: ❌</strong> {error}
        </div>
      )}

      {!loading && projects.length === 0 && !error && (
        <div className="empty-state">
          <i className="fas fa-folder-open empty-icon"></i>
          <p>No projects found 😞. Create your first project to get started! 🚀</p>
          <button className="btn btn-primary" onClick={() => navigate('/create')}>
            ➕ Create New Project
          </button>
        </div>
      )}

      {projects.length > 0 && (
        <div className="project-cards">
          {projects.map((project) => (
            <div
              className="project-card"
              key={project}
              onClick={() => navigate(`/project/${project}`)}
            >
              <div className="project-card-header">
                <i className="fas fa-code"></i>
                <h3>{project}</h3>
              </div>
              <div className="project-card-actions">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project}`);
                  }}
                >
                  🔍 View Details
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/project/${project}/ask`);
                  }}
                >
                  ❓ Ask Question
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ================================================= create project =========================================================

function CreateProject() {
  const [projName, setProjName] = useState('');
  const [files, setFiles] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projName.trim()) {
      setError('🚨 Project name is required!');
      return;
    }

    if (!files || files.length === 0) {
      setError('🚨 Please upload at least one file.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('project_name', projName);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      await axios.post(`${API_URL}/project/create`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/projects'); // Navigate to the project list upon success
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-project-container">
      <div className="page-header">
        <h2>Create New Project 🚀</h2>
        <button className="btn btn-text" onClick={() => navigate('/projects')}>
          <i className="fas fa-arrow-left"></i> Back to Projects 🔙
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <strong>Error: </strong> {error}
          <button className="alert-close" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name 📝</label>
            <input
              type="text"
              id="projectName"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              placeholder="Enter your project name here"
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label>Upload Files 📂</label>
            <div
              className={`file-upload-area ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="fileUpload"
                multiple
                onChange={handleFileSelect}
                className="file-input"
                disabled={isSubmitting}
              />
              <label htmlFor="fileUpload" className="file-label">
                <div className="file-label-main">
                  <div>
                    <i className="fas fa-cloud-upload-alt"></i>
                  </div>
                  <span>Drag and drop your files here, or click to browse 📤</span>
                </div>
                <small>
                  Allowed file types: .py, .js, .java, .cpp, .c, .h, .cs, .rb, .go, .php
                </small>
              </label>
            </div>

            {files && files.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files ({files.length}) 📄</h4>
                <ul>
                  {Array.from(files).map((file, index) => (
                    <li key={index}>
                      <i className="fas fa-file-code"></i> {file.name}
                      <span className="file-size"> ({(file.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-text"
              onClick={() => navigate('/projects')}
              disabled={isSubmitting}
            >
              Cancel ❌
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="btn-spinner"></div> Creating Project...
                </>
              ) : (
                'Create Project 🚀'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================================================== project details ===========================================

function ProjectDetails() {
  const { projectName } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalysis();
  }, [projectName]);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/project/${projectName}`);
      setAnalysis(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await axios.get(`${API_URL}/project/${projectName}/report`, {
        responseType: 'blob',
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary anchor element, click it, then remove it
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${projectName}_report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Helper to format key names (e.g., converting camelCase/snake_case to Title Case)
  const formatKey = (key) => {
    const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const renderAnalysisData = (data) => {
    if (!data) return null;
  
    if (typeof data === 'string') {
      // Properly format markdown-style headings and new lines
      const formatted = data.replace(/\*\*(.*?)\*\*/g, "\n\n<strong>$1</strong>\n\n");
      const lines = formatted.split('\n').filter((line) => line.trim() !== '');
  
      return lines.map((line, idx) => {
        if (line.startsWith("<strong>") && line.endsWith("</strong>")) {
          // Render headings properly
          return (
            <h3 key={idx} style={{ marginTop: "1em" }}>
              {line.replace("<strong>", "").replace("</strong>", "")}
            </h3>
          );
        } else if (/^\d+\.\s*/.test(line)) {
          // Preserve numbering
          return <p key={idx} style={{ marginLeft: "1em" }}>{line}</p>;
        } else {
          return <p key={idx}>{line}</p>;
        }
      });
    } else if (typeof data === 'object') {
      return (
        <div className="analysis-sections">
          {Object.entries(data).map(([key, value]) => (
            <div className="analysis-section" key={key}>
              <h4>{formatKey(key)}</h4>
              {renderAnalysisData(value)}
            </div>
          ))}
        </div>
      );
    }
  
    return <p>{JSON.stringify(data)}</p>;
  };

  return (
    <div className="project-details-container">
      <div className="page-header">
        <div className="page-title">
          <h2>Project: {projectName} 🔍</h2>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate(`/project/${projectName}/ask`)}
          >
            <i className="fas fa-question-circle"></i> Ask a Question ❓
          </button>
          <button 
            className="btn btn-primary" 
            onClick={generateReport}
            disabled={isGeneratingReport || loading}
          >
            {isGeneratingReport ? (
              <>
                <div className="btn-spinner"></div> Generating Report...
              </>
            ) : (
              <>
                <i className="fas fa-file-download"></i> Generate Report 📄
              </>
            )}
          </button>
        </div>
      </div>
      
      <button className="btn btn-text back-button" onClick={() => navigate('/')}>
        <i className="fas fa-arrow-left"></i> Back to Projects 🚀
      </button>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner large"></div>
          <p>Analyzing project... Please wait ⏳</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <strong>Error: ⚠️</strong> {error}
        </div>
      ) : analysis ? (
        <div className="analysis-results">
          <div className="card">
            <div className="card-header">
              <h3>Analysis Results 🧠</h3>
            </div>
            <div className="card-body">
              {renderAnalysisData(analysis)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function renderValue(value) {
  if (value === null || value === undefined) {
    return <span className="text-muted">None</span>;
  }
  
  if (typeof value === 'object' && !Array.isArray(value)) {
    return (
      <div className="nested-object">
        {Object.entries(value).map(([k, v]) => (
          <div className="nested-item" key={k}>
            <strong>{formatKey(k)}:</strong> {renderSimpleValue(v)}
          </div>
        ))}
      </div>
    );
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted">Empty list</span>;
    }
    return (
      <ul className="analysis-list">
        {value.map((item, index) => (
          <li key={index}>{renderSimpleValue(item)}</li>
        ))}
      </ul>
    );
  }
  
  return renderSimpleValue(value);
}

function renderSimpleValue(value) {
  if (typeof value === 'object') {
    return <pre>{JSON.stringify(value, null, 2)}</pre>;
  }
  return <span>{String(value)}</span>;
}

// -========================================================= ask questions ========================================
function AskQuestion() {
  const { projectName } = useParams();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const questionInputRef = React.useRef(null);

  useEffect(() => {
    // Load question history from localStorage
    const savedHistory = localStorage.getItem(`questionHistory_${projectName}`);
    if (savedHistory) {
      try {
        setQuestionHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse question history', e);
      }
    }
    // Focus the question input on load
    if (questionInputRef.current) {
      questionInputRef.current.focus();
    }
  }, [projectName]);

  const saveQuestionToHistory = (q, a) => {
    const newHistory = [
      { question: q, answer: a, timestamp: new Date().toISOString() },
      ...questionHistory,
    ].slice(0, 10); // Keep only the 10 most recent questions

    setQuestionHistory(newHistory);
    localStorage.setItem(`questionHistory_${projectName}`, JSON.stringify(newHistory));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('🚨 Please enter a question before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The Flask backend expects a GET request with the question in the URL
      const response = await axios.get(
        `${API_URL}/project/${projectName}/${encodeURIComponent(question)}`
      );
      setAnswer(response.data);
      saveQuestionToHistory(question, response.data);
      setQuestion(''); // Clear the input after submission
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated history item click handler: stops event propagation and updates state
  const handleHistoryItemClick = (item, e) => {
    e.stopPropagation();
    if (item && item.question !== undefined && item.answer !== undefined) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setShowHistory(false); // Close the modal upon selection
    } else {
      console.error('Invalid history item:', item);
    }
  };

  const clearHistory = () => {
    setQuestionHistory([]);
    localStorage.removeItem(`questionHistory_${projectName}`);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  // Helper to format answer text into paragraphs
  const formatAnswerText = (text) => {
    const paragraphs = text.split(/\n+|\.\s+/).filter(Boolean);
    return paragraphs.map((para, index) => (
      <p key={index} style={{ marginBottom: '1em' }}>
        {para.trim()}
        {text.includes('. ') && index < paragraphs.length - 1 ? '.' : ''}
      </p>
    ));
  };

  return (
    <div className="ask-question-container">
      {/* Main Content Wrapper; blur when history modal is open */}
      <div style={showHistory ? { filter: 'blur(4px)', pointerEvents: 'none' } : {}}>
        <div className="page-header">
          <h2>Ask about {projectName} 🤔</h2>
          <button className="btn btn-text" onClick={() => navigate(`/project/${projectName}`)}>
            <i className="fas fa-arrow-left"></i> Back to Project 🚀
          </button>
        </div>

        {/* Answer Section */}
        <div className="answer-panel">
          <div className="card">
            <div className="card-header">
              <h3>Answer 💡</h3>
            </div>
            <div className="card-body" style={{ maxWidth: '100%', overflowWrap: 'break-word' }}>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Analyzing your question... ⏳</p>
                </div>
              ) : answer ? (
                <div
                  className="answer-content"
                  style={{
                    padding: '1em',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                  }}
                >
                  {typeof answer === 'object' && typeof answer.answer === 'string' ? (
                    formatAnswerText(answer.answer)
                  ) : typeof answer === 'object' ? (
                    <pre className="code-block">{JSON.stringify(answer, null, 2)}</pre>
                  ) : (
                    formatAnswerText(String(answer))
                  )}
                </div>
              ) : (
                <div className="empty-answer">
                  <i className="fas fa-search"></i>
                  <p>Ask a question about your project to get an answer 🧐</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Question Input Section */}
        <div className="question-input-panel" style={{ marginTop: '2em' }}>
          <div className="card">
            <div className="card-header">
              <h3>Ask a Question 💬</h3>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <strong>Error: ⚠️</strong> {error}
                  <button className="alert-close" onClick={() => setError(null)}>
                    ×
                  </button>
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="questionInput">Your Question ✍️</label>
                  <textarea
                    id="questionInput"
                    ref={questionInputRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="e.g., What are the main functions in this project?"
                    rows={3}
                    disabled={loading}
                    style={{ width: '100%', resize: 'vertical' }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1em',
                  }}
                >
                  {/* History Button to the left of Ask Button */}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={toggleHistory}
                    style={{ marginRight: '1em' }}
                  >
                    {showHistory ? 'Hide History' : 'View History'} 📜
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="btn-spinner"></div> Analyzing... ⏳
                      </>
                    ) : (
                      'Ask Question'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal Popup */}
      {showHistory && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={toggleHistory}
        >
          <div
            className="modal-content"
            style={{
              background: '#fff',
              padding: '2em',
              borderRadius: '8px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              minWidth: '300px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleHistory}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                fontSize: '1.5em',
                cursor: 'pointer',
              }}
            >
            </button>
            <div className="history-modal-body">
              {questionHistory.length > 0 ? (
                <div>
                  <h4>Recent Questions 🕒</h4>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {questionHistory.map((item, index) => (
                      <li
                        key={index}
                        style={{
                          cursor: 'pointer',
                          padding: '0.5em 0',
                          borderBottom: '1px solid #eee',
                        }}
                        onClick={(e) => handleHistoryItemClick(item, e)}
                      >
                        <span>{item.question}</span>
                        <span style={{ float: 'right', color: '#666' }}>
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-text" onClick={clearHistory}>
                    Clear History 🧹
                  </button>
                </div>
              ) : (
                <div>No history available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
