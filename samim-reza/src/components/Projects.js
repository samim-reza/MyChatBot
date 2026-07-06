import React from 'react';

function Projects() {
  return (
    <section className="panel-section">
      <div className="panel-container">
        <div className="section-label">Projects</div>
        <h2 className="section-heading">Featured Projects</h2>

          <div className="projects-grid">
            <div className="project-card featured">
              <div className="project-icon">
                <i className="fas fa-utensils"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">AI SaaS • Realtime Voice Platform</span>
                    <h3 className="project-title">Sloancode AI Restaurant Platform</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2026</span>
                </div>
                <p className="project-description">
                  Multi-tenant restaurant AI phone receptionist platform with Twilio Media Streams,
                  OpenAI Realtime voice, FastAPI, PostgreSQL, Redis, Chroma-backed RAG, tenant dashboards,
                  deterministic order validation, POS integrations, Stripe payment links, and reporting.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">FastAPI</span>
                  <span className="tech-tag">OpenAI Realtime</span>
                  <span className="tech-tag">Twilio</span>
                  <span className="tech-tag">PostgreSQL</span>
                  <span className="tech-tag">Redis</span>
                  <span className="tech-tag">ChromaDB</span>
                  <span className="tech-tag">Stripe</span>
                </div>
              </div>
            </div>

            <div className="project-card featured">
              <div className="project-icon">
                <i className="fas fa-robot"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">AI & Machine Learning</span>
                    <h3 className="project-title">Personal AI Assistant</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2025</span>
                </div>
                <p className="project-description">
                  Developed a custom AI assistant using LangChain, RAG architecture, and Vector Databases.
                  Deployed on DigitalOcean with FastAPI, ChromaDB, and same-domain streaming chat.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Python</span>
                  <span className="tech-tag">LangChain</span>
                  <span className="tech-tag">RAG</span>
                  <span className="tech-tag">FastAPI</span>
                </div>
                <div className="project-links">
                  <a href="/chat" className="project-btn primary">
                    <i className="fas fa-external-link-alt"></i> Live Demo
                  </a>
                  <a href="https://github.com/samim-reza/MyChatBot" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card featured">
              <div className="project-icon">
                <i className="fas fa-feather-alt"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">AI & NLP • Bengali Language Model</span>
                    <h3 className="project-title">KobitaLM — Bengali Poetry Generator</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2025</span>
                </div>
                <p className="project-description">
                  Fine-tuned Gemma 2 9B model with LoRA and RAG for generating authentic Bengali poetry in styles
                  of classical poets like Rabindranath Tagore, Jibanananda Das, and more. Combines modern transformer
                  architecture with Bengali literary traditions for creative text generation.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Gemma 2 9B</span>
                  <span className="tech-tag">LoRA</span>
                  <span className="tech-tag">RAG</span>
                  <span className="tech-tag">PyTorch</span>
                  <span className="tech-tag">HuggingFace</span>
                  <span className="tech-tag">Bengali NLP</span>
                </div>
                <div className="project-links">
                  <a href="https://huggingface.co/samim-reza/KobitaLM" target="_blank" rel="noopener noreferrer" className="project-btn primary">
                    <i className="fas fa-brain"></i> View Model
                  </a>
                  <a href="https://github.com/samim-reza/KobitaLM" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-heartbeat"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Healthcare AI • PWA</span>
                    <h3 className="project-title">WeCare - Medical Service App</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2025</span>
                </div>
                <p className="project-description">
                  Offline-first medical consultation and triage web app designed for rural/low-connectivity
                  environments. Features AI-powered medical consultations using Qwen3-VL-2B, bilingual support
                  (Bengali/English), and smart offline sync. Built for FutureBuilders2025 to address healthcare
                  accessibility in Bangladesh's rural regions.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">FastAPI</span>
                  <span className="tech-tag">PWA</span>
                  <span className="tech-tag">Ollama</span>
                  <span className="tech-tag">IndexedDB</span>
                  <span className="tech-tag">MySQL</span>
                  <span className="tech-tag">Qwen3-VL</span>
                </div>
                <div className="project-links">
                  <a href="https://github.com/samim-reza/FutureBuilders2025_GreenU_Tensors" target="_blank" rel="noopener noreferrer" className="project-btn primary">
                    <i className="fab fa-github"></i> View Project
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-certificate"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">SaaS • Web Application</span>
                    <h3 className="project-title">TrueDoc</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2026</span>
                </div>
                <p className="project-description">
                  A Django + React SaaS app for digital document attestation in Bangladesh. Replaces repetitive manual attestation with a one-time digital upload verified by authorized officers, providing a permanent verification number and QR-backed record.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Django</span>
                  <span className="tech-tag">React</span>
                  <span className="tech-tag">TypeScript</span>
                  <span className="tech-tag">Tailwind CSS</span>
                </div>
                  <div className="project-links">
                  <a href="https://github.com/samim-reza/TrueDoc" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-bullhorn"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Web Automation • Dashboard</span>
                    <h3 className="project-title">GoUp</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2026</span>
                </div>
                <p className="project-description">
                  A Django-based dashboard for Facebook Lead Ads automation. Connects a Facebook account, syncs pages and forms, ingests leads via webhooks, and triggers automated follow-up messaging rules (email, SMS, WhatsApp).
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Django</span>
                  <span className="tech-tag">Celery</span>
                  <span className="tech-tag">Redis</span>
                  <span className="tech-tag">Meta Graph API</span>
                  <span className="tech-tag">PostgreSQL</span>
                </div>
                  <div className="project-links">
                  <a href="https://github.com/samim-reza/GoUp" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-brain"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Machine Learning</span>
                    <h3 className="project-title">Cirrhosis Outcome Prediction</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2025</span>
                </div>
                <p className="project-description">
                  Built a multi-class classifier for BAIC 2025 hackathon. Handled 40-50% missing data,
                  engineered 55 features from 19 variables, and implemented ensemble models achieving
                  14.5% improvement over baseline.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Python</span>
                  <span className="tech-tag">XGBoost</span>
                  <span className="tech-tag">LightGBM</span>
                  <span className="tech-tag">CatBoost</span>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-school"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Web Development</span>
                    <h3 className="project-title">Hasib Academic System</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2026</span>
                </div>
                <p className="project-description">
                  A production-ready Django application for managing school workflows including admissions, student attendance, notices, teacher accounts, and finance tracking with PDF export. Tailored for Bangla-speaking users.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Django 5</span>
                  <span className="tech-tag">PostgreSQL</span>
                  <span className="tech-tag">Tailwind</span>
                  <span className="tech-tag">Gunicorn</span>
                </div>
                <div className="project-links">
                  <a href="https://hasibislamicacademy.github.io/" target="_blank" rel="noopener noreferrer" className="project-btn primary">
                    <i className="fas fa-external-link-alt"></i> Live
                  </a>
                  <a href="https://github.com/samim-reza/Hasib_School" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Robotics</span>
                    <h3 className="project-title">Mars Rover</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2025</span>
                </div>
                <p className="project-description">
                  Built a functional Mars Rover using C++, Python, and ROS for autonomous navigation.
                  Implemented sensor integration, motor control systems, and real-time decision-making algorithms.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">C++</span>
                  <span className="tech-tag">Python</span>
                  <span className="tech-tag">ROS</span>
                  <span className="tech-tag">IoT</span>
                </div>
                <div className="project-links">
                  <a href="https://github.com/samim-reza/Rover-robot" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-paw"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Desktop Application</span>
                    <h3 className="project-title">Animal Introductory System</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2023</span>
                </div>
                <p className="project-description">
                  Developed a Java-based GUI application using Java Swing and MySQL to provide
                  comprehensive information about animals with an intuitive interface and database connectivity.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Java</span>
                  <span className="tech-tag">Swing</span>
                  <span className="tech-tag">MySQL</span>
                </div>
                <div className="project-links">
                  <a href="https://github.com/samim-reza/Animal_Introductory" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="project-card">
              <div className="project-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="project-content">
                <div className="project-header">
                  <div>
                    <span className="project-category">Web Development</span>
                    <h3 className="project-title">Union Ledger</h3>
                  </div>
                  <span className="project-date"><i className="far fa-calendar"></i> 2026</span>
                </div>
                <p className="project-description">
                  Collaborative financial tracker with consensus-based voting.
                </p>
                <div className="project-tech">
                  <span className="tech-tag">Django</span>
                  <span className="tech-tag">PostgreSQL</span>
                  <span className="tech-tag">Render</span>
                </div>
                <div className="project-links">
                  <a href="https://samim-reza.github.io/union" target="_blank" rel="noopener noreferrer" className="project-btn primary">
                    <i className="fas fa-external-link-alt"></i> Live
                  </a>
                  <a href="https://github.com/samim-reza/union" target="_blank" rel="noopener noreferrer" className="project-btn secondary">
                    <i className="fab fa-github"></i> GitHub
                  </a>
                </div>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}

export default Projects;
