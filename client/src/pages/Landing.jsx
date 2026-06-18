import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import BookCover from '../components/BookCover';
import './Landing.css';

function Landing() {
  const dustCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);
  const [stats, setStats] = useState({
    totalTitles: 120,
    totalBorrowings: 340,
    activeBorrowings: 45,
    returnRate: 98,
    sampleBooks: []
  });

  const handleNav = (e, path) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 400); // Wait 400ms for fade out before navigating
  };

  useEffect(() => {
    const canvas = dustCanvasRef.current;
    if (!canvas) return;
    
    // Clear any existing motes if re-rendered
    canvas.innerHTML = '';
    
    const count = 35; // increased from 18
    for (let i = 0; i < count; i++) {
      const m = document.createElement('div');
      m.className = 'mote';
      const size = 10 + Math.random() * 25; // increased size
      const left = Math.random() * 100;
      const duration = 12 + Math.random() * 15; // slightly faster
      const delay = -(Math.random() * duration); // negative delay so they start already scattered on screen
      const opacity = 0.5 + Math.random() * 0.5; // increased opacity
      
      m.style.width = `${size}px`;
      m.style.height = `${size}px`;
      m.style.left = `${left}%`;
      m.style.bottom = `-${size}px`;
      m.style.animationDuration = `${duration}s`;
      m.style.animationDelay = `${delay}s`;
      m.style.opacity = opacity;
      m.style.animationName = 'drift';
      
      canvas.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('/books/landing-stats');
        if (response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch landing stats", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className={`bl-root ${isExiting ? 'exiting' : ''}`}>
      <h2 className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        Bookly — a warm, elegant library management system landing page
      </h2>

      {/* Ambient light blobs */}
      <div className="bl-ambient bl-ambient-1"></div>
      <div className="bl-ambient bl-ambient-2"></div>

      {/* Dust motes */}
      <div className="dust-canvas" ref={dustCanvasRef}></div>

      {/* Nav */}
      <nav className="bl-nav">
        <Link to="/" className="bl-logo">
          <img
            src={`${process.env.PUBLIC_URL}/bookly-logo.png`}
            alt="Bookly"
            style={{ height: '36px', objectFit: 'contain' }}
          />
          <span style={{ letterSpacing: '0.12em' }}>BOOKLY</span>
        </Link>
        <ul className="bl-nav-links">
          <li><Link to="/books">Catalog</Link></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#roles">For Admins</a></li>
        </ul>
        <div className="bl-nav-actions">
          <a href="/login" onClick={(e) => handleNav(e, '/login')} className="btn-outline">Sign In</a>
          <a href="/register" onClick={(e) => handleNav(e, '/register')} className="btn-primary">Get Started</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="bl-hero">
        <div className="bl-hero-badge">
          <i className="ti ti-sparkles" aria-hidden="true" style={{ fontSize: '13px' }}></i>
          A scholarly reading experience
        </div>
        <h1>Your Gateway to <em>Infinite Stories</em></h1>
        <p>Bookly is an elegant digital library platform — borrow titles, track your reading, and let admins manage every detail with precision and ease.</p>
        <div className="bl-hero-ctas">
          <Link to="/books" className="btn-primary-lg">
            <i className="ti ti-books" aria-hidden="true"></i>
            Browse Catalog
          </Link>
          <a href="/login" onClick={(e) => handleNav(e, '/login')} className="btn-outline-lg">
            <i className="ti ti-login" aria-hidden="true"></i>
            Sign In
          </a>
        </div>
      </section>

      {/* App Preview */}
      <div className="bl-preview">
        <div className="bl-preview-card">
          <div className="bl-preview-bar">
            <div className="bl-dot" style={{ background: '#e2b9a0' }}></div>
            <div className="bl-dot" style={{ background: '#d4c4a0' }}></div>
            <div className="bl-dot" style={{ background: '#a8c4a0' }}></div>
            <span style={{ fontSize: '0.75rem', color: '#7a6652', marginLeft: '8px' }}>bookly.app / catalog</span>
          </div>
          <div className="bl-stat-row">
            <div className="bl-stat"><div className="bl-stat-label">Total Titles</div><div className="bl-stat-val">{stats.totalTitles}</div></div>
            <div className="bl-stat"><div className="bl-stat-label">Borrowings</div><div className="bl-stat-val">{stats.totalBorrowings}</div></div>
            <div className="bl-stat"><div className="bl-stat-label">Active</div><div className="bl-stat-val">{stats.activeBorrowings}</div></div>
            <div className="bl-stat"><div className="bl-stat-label">Return Rate</div><div className="bl-stat-val">{stats.returnRate}%</div></div>
          </div>
          <div className="bl-book-row">
            {stats.sampleBooks && stats.sampleBooks.length > 0 ? (
                stats.sampleBooks.map((book) => (
                    <div className="bl-book-tile" key={book._id}>
                        <BookCover title={book.title} author={book.author} isLanding={true} />
                    </div>
                ))
            ) : (
                <>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/8444372-M.jpg" alt="The Great Gatsby" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/10636881-M.jpg" alt="Atomic Habits" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/153224-M.jpg" alt="1984" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/7984852-M.jpg" alt="Fahrenheit 451" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/8259443-M.jpg" alt="To Kill a Mockingbird" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                    <div className="bl-book-tile"><img src="https://covers.openlibrary.org/b/id/8410260-M.jpg" alt="Pride and Prejudice" style={{width: '100%', height: '100%', objectFit: 'cover'}}/></div>
                </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="bl-features">
        <p className="bl-section-label">Why Bookly</p>
        <h2 className="bl-section-title">Everything a Library Needs</h2>
        <p className="bl-section-sub">From browsing to borrowing, from analytics to administration — Bookly covers it all with quiet elegance.</p>
        <div className="bl-features-grid">
          <div className="bl-feat-card">
            <div className="bl-feat-icon"><i className="ti ti-book-2" aria-hidden="true"></i></div>
            <div className="bl-feat-title">Curated Catalog</div>
            <p className="bl-feat-desc">Browse a rich, searchable collection organized by title, author, and category. Always know what's available.</p>
          </div>
          <div className="bl-feat-card">
            <div className="bl-feat-icon"><i className="ti ti-transfer" aria-hidden="true"></i></div>
            <div className="bl-feat-title">Seamless Borrowing</div>
            <p className="bl-feat-desc">Borrow and return with a single click. Track all your active loans and due dates in one clean dashboard.</p>
          </div>
          <div className="bl-feat-card">
            <div className="bl-feat-icon"><i className="ti ti-chart-donut" aria-hidden="true"></i></div>
            <div className="bl-feat-title">Rich Analytics</div>
            <p className="bl-feat-desc">Admins get a full analytics suite — genre breakdowns, return rates, and most borrowed titles at a glance.</p>
          </div>
          <div className="bl-feat-card">
            <div className="bl-feat-icon"><i className="ti ti-users" aria-hidden="true"></i></div>
            <div className="bl-feat-title">Role Management</div>
            <p className="bl-feat-desc">Promote students to admin, manage access levels, and keep your library running with full control.</p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section id="roles" className="bl-roles">
        <div className="bl-roles-inner">
          <div className="bl-roles-text">
            <p className="bl-section-label" style={{ textAlign: 'left' }}>Built for everyone</p>
            <h2>One Platform,<br/><em style={{ fontStyle: 'italic', color: '#7a6652' }}>Two Experiences</em></h2>
            <p>Whether you're a student discovering your next read or an admin keeping the shelves in order, Bookly adapts to your role beautifully.</p>
            <a href="/register" onClick={(e) => handleNav(e, '/register')} className="btn-primary" style={{ padding: '0.75rem 1.6rem', fontSize: '0.95rem' }}>Explore Features ↗</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="bl-role-card">
              <span className="bl-role-pill pill-student">For Students</span>
              <div className="bl-role-title">Discover &amp; Borrow</div>
              <ul className="bl-role-list">
                <li>Search the full library catalog instantly</li>
                <li>See real-time availability for every title</li>
                <li>Track borrowed books and due dates</li>
                <li>Browse by genre, author, or keyword</li>
              </ul>
            </div>
            <div className="bl-role-card">
              <span className="bl-role-pill pill-admin">For Admins</span>
              <div className="bl-role-title">Manage &amp; Analyze</div>
              <ul className="bl-role-list">
                <li>Add, edit, and remove books from inventory</li>
                <li>Promote or demote member roles instantly</li>
                <li>View borrowing trends and popular genres</li>
                <li>Monitor return rates and active loans</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bl-cta">
        <div className="bl-cta-box">
          <h2>Open the Doors to Your Library</h2>
          <p>Join Bookly today and give your community the reading experience they deserve — thoughtful, simple, and beautifully designed.</p>
          <a href="/register" onClick={(e) => handleNav(e, '/register')} className="btn-cream">
            Get Started Free
            <i className="ti ti-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bl-footer">
        <div className="bl-footer-logo">
          <img
            src={`${process.env.PUBLIC_URL}/bookly-logo.png`}
            alt="Bookly"
            style={{ height: '24px', objectFit: 'contain' }}
          />
          <span style={{ letterSpacing: '0.12em' }}>BOOKLY</span>
        </div>
        <div className="bl-footer-links">
          <Link to="/books">Catalog</Link>
          <a href="#features">Features</a>
          <a href="#roles">For Admins</a>
          <Link to="/">Privacy</Link>
          <Link to="/">Terms</Link>
        </div>
        <div className="bl-footer-copy">© 2026 Bookly. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Landing;
