import React from 'react';

function Research() {
  return (
    <section className="panel-section">
      <div className="panel-container">
        <div className="section-label">Research</div>
        <h2 className="section-heading">Publications & Ongoing Research</h2>

          <div className="services-grid">
            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-file-signature"></i>
              </div>
              <h4>Edge Detection for Smoke-Degraded Images using Fractional Derivative</h4>
              <p>
                Computer Vision & Image Processing - Recently Published Paper
              </p>
            </div>

            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-image"></i>
              </div>
              <h4>Denoising Diffusion Probabilistic Models</h4>
              <p>
                Computer Vision & Generative AI - Integrating edge detection for enhanced image generation.
              </p>
            </div>

            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-network-wired"></i>
              </div>
              <h4>Federated Learning</h4>
              <p>
                Distributed Machine Learning - Adaptive client selection algorithms for optimal convergence.
              </p>
            </div>

            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-users-cog"></i>
              </div>
              <h4>Human-in-the-Loop ML</h4>
              <p>
                Interactive Machine Learning Systems - Survey on HITL approaches in modern ML systems.
              </p>
            </div>
          </div>
      </div>
    </section>
  );
}

export default Research;
