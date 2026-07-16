import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, PlusCircle, Search, Home, LayoutDashboard, ShieldAlert, Sun, Moon, Menu, X } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMenu = () => setIsMenuOpen((current) => !current);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header-glass">
      <div className="container nav-flex">
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <div className="logo-icon">🦁</div>
          <div className="logo-text">
            <span className="logo-title">SLTC PORTAL</span>
            <span className="logo-subtitle">LOST & FOUND SYSTEM</span>
          </div>
        </Link>

        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          >
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="mobile-menu-button" type="button" onClick={toggleMenu} aria-label="Toggle navigation menu">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className={`nav-container ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-nav-header">
            <Link to="/" className="logo-container" onClick={closeMenu}>
              <div className="logo-icon">🦁</div>
              <div className="logo-text">
                <span className="logo-title">SLTC PORTAL</span>
              </div>
            </Link>
            <button className="mobile-close-button" type="button" onClick={closeMenu} aria-label="Close navigation menu">
              <X size={20} />
            </button>
          </div>
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Home size={16} />
                  <span>Home</span>
                </div>
              </NavLink>
            </li>
            <li>
              <NavLink to="/search" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Search size={16} />
                  <span>Browse Items</span>
                </div>
              </NavLink>
            </li>

            {user && (
              <>
                <li>
                  <NavLink to="/report" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <PlusCircle size={16} />
                      <span>Report Item</span>
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <LayoutDashboard size={16} />
                      <span>Dashboard</span>
                    </div>
                  </NavLink>
                </li>
                {(user.role === 'admin' || user.role === 'security') && (
                  <li>
                    <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--sltc-gold)' }}>
                        <ShieldAlert size={16} />
                        <span style={{ fontWeight: '600' }}>Admin Panel</span>
                      </div>
                    </NavLink>
                  </li>
                )}
              </>
            )}

            <li style={{ marginLeft: '12px' }}>
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '14px', margin: 0 }}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--sltc-blue)' }}>{user.username}</span>
                  </div>
                  <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <User size={14} />
                  <span>Log In / Sign Up</span>
                </Link>
              )}
            </li>
          </ul>
        </nav>
        <div className={`mobile-backdrop ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu} />
      </div>
    </header>
  );
};

export default Navbar;
