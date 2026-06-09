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
                I am a Computer Science & Engineering graduate from Green University of
                Bangladesh and currently working as a Machine Learning Engineer at Brandifies.
                I have a strong passion for programming, machine learning, robotics, and
                problem-solving. As a three-time ICPC regionalist with over 1000+
                problems solved on various online judges, I have demonstrated
                excellence in competitive programming.
              </p>
              <p>
                Having served as a Teaching Assistant, Programming Trainer,
                and Robotics Engineer Intern, I have gained valuable experience
                tackling challenging problems and sharing my knowledge with others. My technical
                expertise spans various programming languages, LLM integration, and competition.
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
                  <h4 className="stat-number">7+</h4>
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
