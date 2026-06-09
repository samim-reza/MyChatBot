import React from 'react';

function Education() {
  return (
    <section className="panel-section">
      <div className="panel-container">
        <div className="section-label">Education</div>
        <h2 className="section-heading">Education</h2>

          <div className="services-grid">
            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h4 style={{marginBottom: '4px'}}>B.Sc. in Computer Science and Engineering</h4>
              <div style={{color: 'var(--brand)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600'}}>
                Green University of Bangladesh | Jan 2022 - Dec 2025
              </div>
              <p><strong>Current CGPA:</strong> 3.80/4.00</p>
            </div>

            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-university"></i>
              </div>
              <h4 style={{marginBottom: '4px'}}>Higher Secondary School Certificate</h4>
              <div style={{color: 'var(--brand)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600'}}>
                Government Bangabandhu College, Gopalganj | Apr 2017 - Mar 2019
              </div>
              <p><strong>GPA:</strong> 4.75/5.00</p>
            </div>

            <div className="service-card">
              <div className="stat-icon" style={{marginBottom: '12px'}}>
                <i className="fas fa-school"></i>
              </div>
              <h4 style={{marginBottom: '4px'}}>Secondary School Certificate</h4>
              <div style={{color: 'var(--brand)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '600'}}>
                S.M. Model Govt. High School, Gopalganj | Jan 2012 - Mar 2017
              </div>
              <p><strong>GPA:</strong> 5.00/5.00</p>
            </div>
          </div>
      </div>
    </section>
  );
}

export default Education;
