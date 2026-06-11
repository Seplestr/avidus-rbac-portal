import React, { useEffect, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Typing effect state
  const [topText, setTopText] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [restText, setRestText] = useState('');

  useEffect(() => {
    document.title = 'Avidus | RBAC & User Activity Portal';

    const firstLine = "Secure Your";
    const highlightWord = "Digital";
    const restOfLine = " Permissions";

    const speed = 70;
    let charIndex = 0;

    // Step 1: Type "Secure Your"
    const typeTop = () => {
      if (charIndex <= firstLine.length) {
        setTopText(firstLine.substring(0, charIndex));
        charIndex++;
        setTimeout(typeTop, speed);
      } else {
        charIndex = 0;
        setTimeout(typeHighlight, 200);
      }
    };

    // Step 2: Type "Digital"
    const typeHighlight = () => {
      if (charIndex <= highlightWord.length) {
        setHighlightText(highlightWord.substring(0, charIndex));
        charIndex++;
        setTimeout(typeHighlight, speed);
      } else {
        charIndex = 0;
        setTimeout(typeRest, speed);
      }
    };

    // Step 3: Type " Permissions"
    const typeRest = () => {
      if (charIndex <= restOfLine.length) {
        setRestText(restOfLine.substring(0, charIndex));
        charIndex++;
        setTimeout(typeRest, speed);
      }
    };

    typeTop();
  }, []);

  return (
    <div className="home-page">
      {/* Background decoration elements */}
      <div className="glow-bubble bubble-1"></div>
      <div className="glow-bubble bubble-2"></div>

      {/* Floating Header */}
      <header className="home-header">
        <div className="home-container">
          <div className="home-nav">
            <Link to="/" className="home-logo">
              <span className="logo-brand">Avidus</span>
              <span className="logo-dot"></span>
            </Link>
            
            <div className="home-auth-ctas">
              {user ? (
                <>
                  <span className="user-welcome">Signed in as <strong style={{ color: '#fff' }}>{user.email}</strong></span>
                  {user.role === 'Admin' ? (
                    <Link to="/admin-dashboard" className="home-btn home-btn-primary">
                      Go to Admin Console
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="home-btn home-btn-primary">
                      Go to Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="home-btn home-btn-secondary">
                    Sign In
                  </Link>
                  <Link to="/register" className="home-btn home-btn-primary">
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>RBAC & USER ACTIVITY AUDITING</span>
            </div>
            
            <h1 className="hero-title">
              <div className="title-top">{topText}</div>
              <div className="title-bottom">
                <span className="title-highlight">{highlightText}</span>
                {restText}
              </div>
            </h1>

            <p className="hero-desc">
              We help operations replace permission chaos with absolute clarity and execution. 
              From dynamic route guarding to live system-wide activity logs, we provide a secure, 
              scalable workspace designed to isolate user tasks and audit operations instantly.
            </p>

            <div className="hero-actions">
              {user ? (
                user.role === 'Admin' ? (
                  <Link to="/admin-dashboard" className="home-btn home-btn-primary home-btn-lg">
                    Access Admin Console
                  </Link>
                ) : (
                  <Link to="/dashboard" className="home-btn home-btn-primary home-btn-lg">
                    Go to Dashboard
                  </Link>
                )
              ) : (
                <>
                  <Link to="/login" className="home-btn home-btn-primary home-btn-lg">
                    Get Started (Sign In)
                  </Link>
                  <Link to="/register" className="home-btn home-btn-outline home-btn-lg">
                    Create Demo Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="home-stats">
        <div className="home-container">
          <div className="stats-header">
            <h2 className="stats-intro">Real-world security and transparency</h2>
            <p className="stats-sub">Solved access isolation, automated audit logging, and scaled control structures that actually work.</p>
          </div>

          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Data Isolation</div>
              <div className="stat-sublabel">Strict schema-level filtering ensures users only access their own tasks.</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">Real-Time</div>
              <div className="stat-label">Activity Logging</div>
              <div className="stat-sublabel">Chronological audit trails track all user creations, updates, and logins.</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">&lt; 10ms</div>
              <div className="stat-label">Route Guarding</div>
              <div className="stat-sublabel">Token-based authentication guarantees prompt role-based redirection.</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">Instant</div>
              <div className="stat-label">Status Audits</div>
              <div className="stat-sublabel">Account suspension or deactivation cuts API access immediately.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services/Features Section */}
      <section className="home-features">
        <div className="home-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Role-Based Access Control</h3>
              <p>Define clear user policies. Restrict pages dynamically on the client and enforce strict JWT token validation on protected endpoints.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Task Management</h3>
              <p>Checklist tracker featuring text searches, filtering, and status updates, built on top of high-contrast flat layout elements.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Live Activity Audits</h3>
              <p>Admins can review a chronological list of actions, tracking the exact actions and email addresses across the platform.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>System Metrics</h3>
              <p>Get bird's-eye metrics summarizing system activity including users, tasks, and completed checklist percentages.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer-dark">
        <div className="home-container">
          <div className="footer-inner">
            <div className="footer-brand">
              <strong>Avidus Portal</strong>
              <p>© 2026 Avidus Interactive inspired workspace. Built for security & clarity.</p>
            </div>
            <div className="footer-links">
              <Link to="/login">Sign In</Link>
              <Link to="/register">Register</Link>
              <a href="https://www.avidusinteractive.com" target="_blank" rel="noopener noreferrer">Official Website</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
