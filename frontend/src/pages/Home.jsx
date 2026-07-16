import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, PlusCircle, ShieldCheck, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';
import gsap from 'gsap';

const Home = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ reported: 0, returned: 0, activeClaims: 0 });
  const heroRef = useRef(null);
  const heroContentRef = useRef(null);
  const heroVisualRef = useRef(null);
  const statsRef = useRef(null);
  const recentCardsRef = useRef([]);
  const featureCardsRef = useRef([]);

  useEffect(() => {
    const fetchRecentItems = async () => {
      try {
        const response = await fetch('/api/items');
        if (response.ok) {
          const data = await response.json();
          setRecentItems(data.slice(0, 3));

          const reported = data.length;
          const returned = data.filter((item) => item.status === 'returned').length;
          const activeClaims = data.filter((item) => item.status === 'claimed').length;
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTimeline
        .from(heroRef.current, { opacity: 0, y: 24, duration: 0.7 })
        .from([heroContentRef.current, heroVisualRef.current], { opacity: 0, y: 28, duration: 0.7, stagger: 0.15 }, '-=0.25')
        .from(statsRef.current, { opacity: 0, y: 18, duration: 0.55 }, '-=0.2');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const cards = recentCardsRef.current.filter(Boolean);
    if (cards.length) {
      gsap.from(cards, { opacity: 0, y: 24, duration: 0.6, stagger: 0.12, ease: 'power3.out' });
    }
  }, [loading, recentItems]);

  useEffect(() => {
    const cards = featureCardsRef.current.filter(Boolean);
    if (cards.length) {
      gsap.from(cards, { opacity: 0, y: 24, duration: 0.6, stagger: 0.14, delay: 0.1, ease: 'power3.out' });
    }
  }, []);

  return (
    <div className="animate-fade-in">
      <section className="hero" ref={heroRef}>
        <div className="container hero-grid">
          <div ref={heroContentRef}>
            <h1 className="hero-title animate-fade-in-up">
              Lost Something? <br />
              <span style={{ color: 'var(--sltc-gold)' }}>We'll Help You Find It.</span>
            </h1>
            <p className="hero-subtitle animate-fade-in-up delay-100 stagger-load">
              SLTC Research University's official digital Lost & Found portal. Report missing items, search discovered property, and claim your belongings quickly.
            </p>
            <div className="hero-actions animate-fade-in-up delay-200 stagger-load">
              <Link to="/search" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                <Search size={18} />
                <span>Browse Found Items</span>
              </Link>
              <Link to="/report" className="btn btn-accent" style={{ padding: '12px 24px' }}>
                <PlusCircle size={18} />
                <span>Report Lost / Found</span>
              </Link>
            </div>

            <div className="hero-stats animate-fade-in-up delay-300 stagger-load" ref={statsRef}>
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

          <div className="hero-visual animate-fade-in-right delay-200 stagger-load" ref={heroVisualRef}>
            <div className="hero-circle"></div>
            <div className="hero-card-stack animate-float">
              <div>
                <span className="status-pill status-available pulse-available" style={{ marginBottom: '12px' }}>
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
              {recentItems.map((item, idx) => (
                <div
                  className={`card animate-fade-in-up stagger-load delay-${(idx + 1) * 100}`}
                  key={item.id}
                  ref={(element) => {
                    recentCardsRef.current[idx] = element;
                  }}
                >
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

      <section style={{ padding: '80px 0', backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '32px', color: 'var(--sltc-blue)', marginBottom: '48px' }}>
            System Objectives & Design Features
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            <div
              className="animate-fade-in-up stagger-load delay-100"
              ref={(element) => {
                featureCardsRef.current[0] = element;
              }}
              style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sltc-blue-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--sltc-blue)', marginBottom: '16px', justifyContent: 'center' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Centralized Database</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Replaces cluttered and temporary WhatsApp notifications with a searchable and queryable log of items.
              </p>
            </div>

            <div
              className="animate-fade-in-up stagger-load delay-200"
              ref={(element) => {
                featureCardsRef.current[1] = element;
              }}
              style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--sltc-blue-glow)', display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'var(--sltc-blue)', marginBottom: '16px', justifyContent: 'center' }}>
                <PlusCircle size={24} />
              </div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Quick Log Reporting</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Upload photos, pick tags (Location, Categories, Date), and insert descriptions in under a minute.
              </p>
            </div>

            <div
              className="animate-fade-in-up stagger-load delay-300"
              ref={(element) => {
                featureCardsRef.current[2] = element;
              }}
              style={{ backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
            >
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
