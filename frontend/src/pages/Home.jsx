import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ShieldCheck, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reported: 0, returned: 0, activeClaims: 0 });

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (response.ok) {
          const data = await response.json();
          setRecentItems(data.slice(0, 3));
          
          // Calculate counts
          const reported = data.length;
          const returned = data.filter(i => i.status === 'returned').length;
          const activeClaims = data.filter(i => i.status === 'claimed').length;
          setStats({ reported, returned, activeClaims });
        }
      } catch (err) {
        console.error('Error fetching recent items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentItems();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1 className="hero-title">
              Lost Something? <br />
              <span style={{ color: 'var(--sltc-gold)' }}>We'll Help You Find It.</span>
            </h1>
            <p className="hero-subtitle">
              SLTC Research University's official digital Lost & Found portal. Report missing items, search discovered property, and claim your belongings quickly.
            </p>
            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <Search size={18} />
                <span>Browse Found Items</span>
              </Link>
              <Link to="/report" className="btn btn-accent" style={{ padding: '12px 24px' }}>
                <PlusCircle size={18} />
                <span>Report Lost / Found</span>
              </Link>
            </div>
            
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.reported || 12}</span>
                <span className="stat-label">Total Items Logged</span>
              </div>
              <div className="stat-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '40px' }}>
                <span className="stat-number">{stats.returned || 5}</span>
                <span className="stat-label">Returned to Owners</span>
              </div>
              <div className="stat-item" style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '40px' }}>
                <span className="stat-number">{stats.activeClaims || 2}</span>
                <span className="stat-label">Pending Claims</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-circle"></div>
            <div className="hero-card-stack">
              <div>
                <span className="status-pill status-available" style={{ marginBottom: '12px' }}>
                  Available
                </span>
                <h3 style={{ fontSize: '20px', color: 'var(--sltc-blue)', marginBottom: '8px' }}>
                  Dell Laptop Charger
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Found inside Lecture Hall B. Black 65W charger.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} />
                  <span>Lecture Hall B</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} />
                  <span>Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Items Section */}
      <section style={{ padding: '60px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
            <div>
              <h2 style={{ fontSize: '28px', color: 'var(--sltc-blue)' }}>Recent Board Activity</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                Latest items reported lost or found across SLTC campus.
              </p>
            </div>
            <Link to="/search" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              <span>View All Items</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="spinner"></div>
            </div>
          ) : recentItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
              No items reported recently.
            </p>
          ) : (
            <div className="grid-cards">
              {recentItems.map(item => (
                <div className="card" key={item.id}>
                  <div className="card-img-container">
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.title} className="card-img" />
                    ) : (
                      <span className="card-placeholder-icon" style={{ fontSize: '32px' }}>
                        {item.category === 'Electronics' ? '💻' :
                         item.category === 'Documents' ? '📁' :
                         item.category === 'Keys' ? '🔑' : '🎒'}
                      </span>
                    )}
                    <span className={`card-badge ${item.type === 'lost' ? 'badge-lost' : 'badge-found'}`}>
                      {item.type}
                    </span>
                  </div>
                  <div className="card-content">
                    <span className="card-category">{item.category}</span>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-meta-list">
                      <div className="card-meta-item">
                        <MapPin size={12} className="card-meta-icon" />
                        <span>{item.location}</span>
                      </div>
                      <div className="card-meta-item">
                        <Calendar size={12} className="card-meta-icon" />
                        <span>{item.date}</span>
                      </div>
                      <div className="card-meta-item">
                        <Clock size={12} className="card-meta-icon" />
                        <span>Status: </span>
                        <span className={`status-pill status-${item.status}`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>By: {item.reportedByName}</span>
                    <Link to={`/search?id=${item.id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '32px', color: 'var(--sltc-blue)', marginBottom: '48px' }}>
            System Objectives & Design Features
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sltc-blue-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--sltc-blue)', marginBottom: '16px', justifyContent: 'center' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Centralized Database</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Replaces cluttered and temporary WhatsApp notifications with a searchable and queryable log of items.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sltc-blue-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--sltc-blue)', marginBottom: '16px', justifyContent: 'center' }}>
                <PlusCircle size={24} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Quick Log Reporting</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Upload photos, pick tags (Location, Categories, Date), and insert descriptions in under a minute.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sltc-blue-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--sltc-blue)', marginBottom: '16px', justifyContent: 'center' }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Secure Verification</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Admin and Security approval systems ensure items are only claimed by their rightful owners.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
