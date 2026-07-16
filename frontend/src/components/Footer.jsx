import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer animate-fade-in">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🦁 SLTC Research University</span>
            </h3>
            <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', color: '#94a3b8' }}>
              Web Based Lost & Found System developed for the CCS2311 Human Factors in Computer Systems Module. Providing a centralized, user-centric approach to asset management on campus.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={14} className="card-meta-icon" />
                <span>SLTC Research University, Padukka, Sri Lanka</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} className="card-meta-icon" />
                <span>+94 11 210 0500</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} className="card-meta-icon" />
                <span>support@sltc.ac.lk</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="footer-title" style={{ fontSize: '15px' }}>Project Group 22</h4>
            <ul className="footer-links" style={{ fontSize: '13px' }}>
              <li>MJ. Ilmaan Ahamed (CIT-24-01-0369)</li>
              <li>M. Mohamed Afrith (CIT-24-01-0297)</li>
              <li>R. Mohamed Himas (CIT-24-01-0302)</li>
              <li>AS. Mohamed Aasim (CIT-24-01-0298)</li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title" style={{ fontSize: '15px' }}>Quick Navigation</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">Home</a></li>
              <li><a href="/search" className="footer-link">Browse Items</a></li>
              <li><a href="/report" className="footer-link">Report Item</a></li>
              <li><a href="/dashboard" className="footer-link">User Dashboard</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SLTC Research University - Group 22. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
