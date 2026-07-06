import React from 'react';

function Home({ onNavigate }) {
  const handleViewPortfolio = (e) => {
    e.preventDefault();
    onNavigate('projects');
  };

  return (
    <section className="about-section panel-view">
      <div className="about-container">
        <div className="about-badge">
          <i className="fas fa-user"></i> Samim Reza
        </div>
        
        <h1 className="about-heading">I am a Programmer</h1>
        
        <div className="about-content-wrapper">
          <div className="about-left">
            <div className="about-intro">
              <p className="about-label">Welcome to my portfolio</p>
              <h2 className="about-title">
                Senior AI Software Engineer at Sloancode, New York
              </h2>
            </div>
            
            <p className="about-description">
              Currently working on the Sloancode AI Restaurant Platform, a multi-tenant
              SaaS system for restaurant AI phone receptionists. I build FastAPI,
              PostgreSQL, Redis, Chroma-backed RAG, Twilio Media Streams, OpenAI
              Realtime voice handling, restaurant dashboards, order validation,
              POS integrations, Stripe payment workflows, and operational reporting.
              Try my{' '}
              <a href="/chat" className="inline-link">
                AI Assistant
              </a>{' '}
              when I am not available.
            </p>
            
            <div className="about-actions">
              <button 
                onClick={handleViewPortfolio}
                className="btn btn-primary"
              >
                View Portfolio <i className="fas fa-arrow-right"></i>
              </button>
              <a 
                href="/assets/documents/cv.pdf" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-text"
              >
                Download CV <i className="fas fa-download"></i>
              </a>
            </div>
          </div>
          
          <div className="about-right">
            <div className="about-image-wrapper">
              <div className="about-image">
                <img src="/assets/images/samim.jpeg" alt="Samim Reza" className="profile-img" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-trophy"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">3x</h3>
              <p className="stat-label">ICPC Regionalist</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-code"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">1000+</h3>
              <p className="stat-label">Problems Solved</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-project-diagram"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">13+</h3>
              <p className="stat-label">Projects Completed</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="stat-content">
              <h3 className="stat-number">3.80</h3>
              <p className="stat-label">Graduation CGPA</p>
            </div>
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="home-contact">
          <div className="section-label">Get in Touch</div>
          <h2 className="contact-title">Let's Connect!</h2>
          <p className="contact-description">
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of your vision.
          </p>
          
          <div className="contact-info-grid">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <div>
                <h4>Email</h4>
                <a href="mailto:samimreza2111@gmail.com">samimreza2111@gmail.com</a>
              </div>
            </div>
            
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <div>
                <h4>Location</h4>
                <p>Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>
          
          <div className="social-links-large">
            <a href="https://github.com/samim-reza" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.facebook.com/samimreza101" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="https://www.instagram.com/samim101/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.linkedin.com/in/samim-reza/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          
          <a href="mailto:samimreza2111@gmail.com" className="btn btn-primary btn-large">
            Email Me <i className="fas fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>
  );
}

export default Home;
