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
                <span className="skill-badge">Python</span>
                <span className="skill-badge">JavaScript</span>
                <span className="skill-badge">TypeScript</span>
                <span className="skill-badge">SQL</span>
                <span className="skill-badge">C++</span>
                <span className="skill-badge">Java</span>
                <span className="skill-badge">PHP</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-brain"></i>
                <h3>AI & Voice Systems</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">OpenAI Realtime</span>
                <span className="skill-badge">Twilio Media Streams</span>
                <span className="skill-badge">RAG</span>
                <span className="skill-badge">ChromaDB</span>
                <span className="skill-badge">LLM Tool Calling</span>
                <span className="skill-badge">Prompt Safety</span>
                <span className="skill-badge">Transcription & VAD</span>
                <span className="skill-badge">LangChain</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-globe"></i>
                <h3>Backend & SaaS</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">FastAPI</span>
                <span className="skill-badge">Django</span>
                <span className="skill-badge">PostgreSQL</span>
                <span className="skill-badge">Redis</span>
                <span className="skill-badge">REST APIs</span>
                <span className="skill-badge">WebSockets</span>
                <span className="skill-badge">Multi-tenant Architecture</span>
                <span className="skill-badge">API Key Auth</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-tools"></i>
                <h3>Integrations & DevOps</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">Docker</span>
                <span className="skill-badge">Git</span>
                <span className="skill-badge">Linux</span>
                <span className="skill-badge">Caddy</span>
                <span className="skill-badge">Stripe</span>
                <span className="skill-badge">POS Integrations</span>
                <span className="skill-badge">Celery</span>
                <span className="skill-badge">Azure</span>
                <span className="skill-badge">DigitalOcean</span>
              </div>
            </div>

            <div className="skill-group">
              <div className="skill-group-header">
                <i className="fas fa-trophy"></i>
                <h3>Engineering Strengths</h3>
              </div>
              <div className="skills-tags">
                <span className="skill-badge">System Design</span>
                <span className="skill-badge">Order Validation</span>
                <span className="skill-badge">Observability</span>
                <span className="skill-badge">Testing & Evaluation</span>
                <span className="skill-badge">Data Structures</span>
                <span className="skill-badge">Algorithms</span>
                <span className="skill-badge highlight">1000+ Problems Solved</span>
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}

export default Skills;
