import React from 'react';

function Skills() {
  return (
    <section className="panel-section">
      <div className="panel-container">
        <div className="section-label">Skills</div>
        <h2 className="section-heading">Technical Skills</h2>

          <div className="skills-wrapper">
            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-code"></i>
                <h3>Programming Languages</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">C</span>
                <span className="skill-badge">C++</span>
                <span className="skill-badge">Python</span>
                <span className="skill-badge">Java</span>
                <span className="skill-badge">JavaScript</span>
                <span className="skill-badge">PHP</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-brain"></i>
                <h3>AI & Machine Learning</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">PyTorch</span>
                <span className="skill-badge">TensorFlow</span>
                <span className="skill-badge">Scikit-learn</span>
                <span className="skill-badge">LangChain</span>
                <span className="skill-badge">VectorDB</span>
                <span className="skill-badge">RAG</span>
                <span className="skill-badge">LLM</span>
                <span className="skill-badge">Roboflow</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-globe"></i>
                <h3>Web & Data</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">Django</span>
                <span className="skill-badge">FastAPI</span>
                <span className="skill-badge">PostgreSQL</span>
                <span className="skill-badge">MySQL</span>
                <span className="skill-badge">Kaggle</span>
                <span className="skill-badge">Machine Learning</span>
                <span className="skill-badge">Data Analysis</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-tools"></i>
                <h3>Tools & Platforms</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">ROS</span>
                <span className="skill-badge">Git</span>
                <span className="skill-badge">Docker</span>
                <span className="skill-badge">LaTeX</span>
                <span className="skill-badge">Linux</span>
                <span className="skill-badge">Render</span>
                <span className="skill-badge">Arduino</span>
                <span className="skill-badge">Raspberry Pi</span>
                <span className="skill-badge">Jetson</span>
                <span className="skill-badge">ESP32</span>
                <span className="skill-badge">Azure</span>
                <span className="skill-badge">PWA</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-trophy"></i>
                <h3>Competitive Programming</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge highlight">1000+ Problems Solved</span>
                <span className="skill-badge">Data Structures</span>
                <span className="skill-badge">Algorithms</span>
                <span className="skill-badge">OOP</span>
                <span className="skill-badge">System Design</span>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}

export default Skills;
