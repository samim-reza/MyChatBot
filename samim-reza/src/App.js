import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Research from './components/Research';
import Experience from './components/Experience';
import Education from './components/Education';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import ChatWidget from './components/ChatWidget';

function App() {
  const [activePanel, setActivePanel] = useState('home');

  useEffect(() => {
    const stored = sessionStorage.getItem('active_panel');
    if (stored) {
      setActivePanel(stored);
    }
    localStorage.removeItem('active_panel');
  }, []);

  const handlePanelChange = (panelId) => {
    setActivePanel(panelId);
    sessionStorage.setItem('active_panel', panelId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPanel = () => {
    switch(activePanel) {
      case 'about': return <About />;
      case 'research': return <Research />;
      case 'experience': return <Experience />;
      case 'education': return <Education />;
      case 'skills': return <Skills />;
      case 'projects': return <Projects />;
      case 'achievements': return <Achievements />;
      case 'contact': return <Contact />;
      case 'home':
      default: return <Home onNavigate={handlePanelChange} />;
    }
  };

  return (
    <div className="app">
      <Header onNavigate={handlePanelChange} activePanel={activePanel} />
      
      <main className="main-content">
        {renderPanel()}
      </main>
      
      <ChatWidget />
    </div>
  );
}

export default App;
