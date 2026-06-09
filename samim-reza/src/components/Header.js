import React, { useState } from 'react';

function Header({ onNavigate, activePanel }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (panelId) => {
    onNavigate(panelId);
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">SR</span>
          <span className="logo-text">Samim Reza</span>
        </div>
        
        <button 
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-menu ${menuOpen ? 'open' : ''}`}>
          <button 
            className={activePanel === 'home' ? 'active' : ''}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>
          {/* <button 
            className={activePanel === 'about' ? 'active' : ''}
            onClick={() => handleNavClick('about')}
          >
            About
          </button> */}
          <button 
            className={activePanel === 'research' ? 'active' : ''}
            onClick={() => handleNavClick('research')}
          >
            Research
          </button>
          <button 
            className={activePanel === 'experience' ? 'active' : ''}
            onClick={() => handleNavClick('experience')}
          >
            Experience
          </button>
          <button 
            className={activePanel === 'education' ? 'active' : ''}
            onClick={() => handleNavClick('education')}
          >
            Education
          </button>
          <button 
            className={activePanel === 'skills' ? 'active' : ''}
            onClick={() => handleNavClick('skills')}
          >
            Skills
          </button>
          <button 
            className={activePanel === 'projects' ? 'active' : ''}
            onClick={() => handleNavClick('projects')}
          >
            Projects
          </button>
          <button 
            className={activePanel === 'achievements' ? 'active' : ''}
            onClick={() => handleNavClick('achievements')}
          >
            Achievements
          </button>
          <button 
            className={activePanel === 'contact' ? 'active' : ''}
            onClick={() => handleNavClick('contact')}
          >
            Contact
          </button>
        </nav>

        <div className="header-social">
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
      </div>
    </header>
  );
}

export default Header;
