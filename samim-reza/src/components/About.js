import React from 'react';

function About() {
  return (
    <section className="panel is-active" aria-label="About">
      <div className="panel-inner">
        <div className="container">
          <div className="section-title">
            <h2>About Me</h2>
            <div className="divider"></div>
          </div>

          <div className="about-content">
            <div className="about-text" style={{gridColumn: '1 / -1', marginBottom: '24px'}}>
              <h3>Hello, I'm Samim Reza</h3>
              <p>
                I am a Senior AI Software Engineer at Sloancode, building production
                AI SaaS systems that connect realtime voice agents, backend services,
                data stores, integrations, dashboards, and operational workflows into
                reliable business products.
              </p>
              <p>
                My work combines FastAPI, PostgreSQL, Redis, Chroma-backed RAG,
                Twilio Media Streams, OpenAI Realtime voice handling, POS integrations,
                payment workflows, and system design. My competitive programming background
                as a three-time ICPC regionalist with 1000+ solved problems still shapes
                how I design, debug, and ship complex software.
              </p>
            </div>

            <div className="about-stats" style={{gridColumn: '1 / -1'}}>
              <div className="stat-card">
                <i className="fas fa-code"></i>
                <div className="stat-info">
                  <h4 className="stat-number">1000+</h4>
                  <p className="stat-label">Problems Solved</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-trophy"></i>
                <div className="stat-info">
                  <h4 className="stat-number">3x</h4>
                  <p className="stat-label">ICPC Regionalist</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-project-diagram"></i>
                <div className="stat-info">
                  <h4 className="stat-number">13+</h4>
                  <p className="stat-label">Projects Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <i className="fas fa-graduation-cap"></i>
                <div className="stat-info">
                  <h4 className="stat-number">3.80</h4>
                  <p className="stat-label">Graduation CGPA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
