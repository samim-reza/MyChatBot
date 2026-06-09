import React from 'react';

function Contact() {
  return (
    <section className="panel-section">
      <div className="panel-container">
        <div className="section-label">Contact</div>
        <h2 className="section-heading">Let's Connect!</h2>
        
        <p className="contact-description">
          I'm always open to discussing new projects, creative ideas, or
          opportunities to be part of your vision.
        </p>
        
        <div className="contact-info">
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
        
        <a href="mailto:samireza2111@gmail.com" className="btn btn-primary btn-large">
          Email Me <i className="fas fa-arrow-right"></i>
        </a>
      </div>
    </section>
  );
}

export default Contact;
