import React from "react";
import Navbar from "../../components/NavbarD";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    
    <div className="dashboard-container">
     
      <div className="dashboard-content">
         <Navbar />
        <header className="dashboard-header">
          
          <h1>Funeral Transport Dashboard</h1>
          <div className="header-actions">
            <button className="btn primary">Refresh Data</button>
            <button className="btn secondary">Generate Report</button>
          </div>
        </header>

        {/* Overview Cards */}
        <section className="overview-section">
          <h2>Overview</h2>
          <div className="overview-cards">
            <div className="card">
              <div className="card-image-container">
                <img src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80" alt="Fleet Vehicle" className="card-image" loading="lazy" />
              </div>
              <div className="card-content">
                <h3>Total Vehicles</h3>
                <span className="stat-value">14</span>
                <div className="stat-details">
                  <span className="stat-positive">10 Active</span>
                  <span className="stat-neutral">4 In Use</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-image-container">
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80" alt="Professional Driver" className="card-image" loading="lazy" />
              </div>
              <div className="card-content">
                <h3>Total Drivers</h3>
                <span className="stat-value">14</span>
                <div className="stat-details">
                  <span className="stat-positive">8 Available</span>
                  <span className="stat-neutral">6 Assigned</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-image-container">
                <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80" alt="Funeral Procession Transport" className="card-image" loading="lazy" />
              </div>
              <div className="card-content">
                <h3>Funeral Transports</h3>
                <span className="stat-value">7</span>
                <div className="stat-details">
                  <span className="stat-neutral">2 In Progress</span>
                  <span className="stat-positive">5 Completed</span>
                </div>
              </div>
            </div>

            <div className="card alert-card">
              <div className="card-image-container">
                <img src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80" alt="Fleet Service Alerts" className="card-image" loading="lazy" />
              </div>
              <div className="card-content">
                <h3>Urgent Alerts</h3>
                <span className="stat-value">3</span>
                <div className="stat-details">
                  <span className="stat-warning">1 Breakdown</span>
                  <span className="stat-warning">2 Low Fuel</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Sections */}
        <div className="main-content">
          {/* Active Transports Section */}
          <section className="content-section">
            <div className="section-header">
              <h2>Active Funeral Transports</h2>
              <button className="btn small">View All</button>
            </div>
            <div className="transport-list">
              <div className="transport-item">
                <div className="transport-icon">🚘</div>
                <div className="transport-details">
                  <h4>Vehicle #A12</h4>
                  <p>Route: City Center to Cemetery</p>
                  <span className="badge in-progress">In Progress</span>
                </div>
                <button className="btn small outline">Details</button>
              </div>
              <div className="transport-item">
                <div className="transport-icon">🚘</div>
                <div className="transport-details">
                  <h4>Vehicle #B45</h4>
                  <p>Route: St. Mary's Church to Greenfield</p>
                  <span className="badge in-progress">In Progress</span>
                </div>
                <button className="btn small outline">Details</button>
              </div>
            </div>
          </section>

          {/* Alerts Section */}
          <section className="content-section alert-section">
            <div className="section-header">
              <h2>Urgent Alerts</h2>
              <button className="btn small">View All</button>
            </div>
            <div className="alert-list">
              <div className="alert-item">
                <div className="alert-icon">⚠️</div>
                <div className="alert-details">
                  <h4>Vehicle #C78</h4>
                  <p>Low Fuel - Needs immediate attention</p>
                  <span className="badge warning">Priority: High</span>
                </div>
                <button className="btn small">Resolve</button>
              </div>
              <div className="alert-item">
                <div className="alert-icon">⚠️</div>
                <div className="alert-details">
                  <h4>Vehicle #D22</h4>
                  <p>Breakdown reported - Requires mechanic</p>
                  <span className="badge warning">Priority: Critical</span>
                </div>
                <button className="btn small">Resolve</button>
              </div>
            </div>
          </section>
        </div>

        {/* Recent Activity Section */}
        <section className="content-section activity-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="btn small">View All</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">✔️</div>
              <div className="activity-details">
                <p>Vehicle #A12 assigned to funeral ID #F123</p>
                <span className="activity-time">10 minutes ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✔️</div>
              <div className="activity-details">
                <p>Driver John Doe completed Route #7</p>
                <span className="activity-time">1 hour ago</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">✔️</div>
              <div className="activity-details">
                <p>Fuel log updated for Vehicle #B45</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;