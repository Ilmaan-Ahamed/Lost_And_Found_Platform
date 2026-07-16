import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Trash2, Bell, CheckSquare, Award, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('reported'); // 'reported', 'claims', 'notifications'
  
  // Lists
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch Items
      const itemsRes = await fetch('/api/items');
      let itemsData = [];
      if (itemsRes.ok) {
        const data = await itemsRes.json();
        itemsData = data.filter(i => i.reportedBy === user.id);
        setMyItems(itemsData);
      }

      // 2. Fetch Claims
      const claimsRes = await fetch('/api/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setMyClaims(claimsData);
      }

      // 3. Fetch Notifications
      const notifRes = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user.id]);

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this reported item?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMyItems(myItems.filter(item => item.id !== itemId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete item.');
      }
    } catch (err) {
      console.error('Delete item error:', err);
      alert('Network error deleting item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsRead = async (notifId) => {
    try {
      const res = await fetch(`/api/notifications/${notifId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleClearNotifications = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (err) {
      console.error('Clear notifications error:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div>
        <h1 style={{ fontSize: '32px', color: 'var(--sltc-blue)' }}>User Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Manage your reported items, track claim reviews, and view system alerts.
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', margin: '20px 0', fontSize: '13px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Sidebar */}
        <aside className="sidebar animate-fade-in">
          <div className="profile-card">
            <div className="avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <h3 className="profile-name">{user.username}</h3>
            <span className="profile-role">{user.role}</span>
            
            <div className="profile-details">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Email:</span>
                <span>{user.email}</span>
              </div>
              {user.registrationNo && (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '6px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Registration No:</span>
                  <span>{user.registrationNo}</span>
                </div>
              )}
              {user.contact && (
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '6px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Contact:</span>
                  <span>{user.contact}</span>
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-menu">
            <button 
              className={`sidebar-menu-btn ${activeTab === 'reported' ? 'active' : ''}`}
              onClick={() => setActiveTab('reported')}
            >
              <CheckSquare size={16} />
              <span>My Reported Items</span>
              <span style={{ marginLeft: 'auto', backgroundColor: 'var(--border-color)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {myItems.length}
              </span>
            </button>
            
            <button 
              className={`sidebar-menu-btn ${activeTab === 'claims' ? 'active' : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              <Award size={16} />
              <span>My Claim Requests</span>
              <span style={{ marginLeft: 'auto', backgroundColor: 'var(--border-color)', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                {myClaims.length}
              </span>
            </button>

            <button 
              className={`sidebar-menu-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <Bell size={16} />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span style={{ marginLeft: 'auto', backgroundColor: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: '700' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <button onClick={fetchDashboardData} className="btn btn-secondary" style={{ width: '100%', fontSize: '13px' }} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spinner' : ''} />
            <span>Refresh Board</span>
          </button>
        </aside>

        {/* Dashboard Main Area */}
        <main className="card" style={{ padding: '24px', minHeight: '400px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {/* My Reported Items Tab */}
              {activeTab === 'reported' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', color: 'var(--sltc-blue)' }}>Reported Items History</h2>
                    <Link to="/report" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                      <PlusCircle size={14} />
                      <span>Report New Item</span>
                    </Link>
                  </div>

                  {myItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't reported any lost or found items yet.</p>
                      <Link to="/report" className="btn btn-secondary">Report Item Now</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myItems.map(item => (
                        <div key={item.id} className="claim-row animate-fade-in" style={{ padding: '16px', gap: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ fontSize: '24px', width: '40px', height: '40px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {item.category === 'Electronics' ? '💻' :
                               item.category === 'Documents' ? '📁' :
                               item.category === 'Keys' ? '🔑' : '🎒'}
                            </div>
                            <div>
                              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>{item.title}</h4>
                              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {item.location} • Reported on {item.date} • <span style={{ textTransform: 'capitalize', fontWeight: '600', color: item.type === 'lost' ? 'red' : 'green' }}>{item.type}</span>
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className={`status-pill status-${item.status}`}>{item.status}</span>
                            <button 
                              onClick={() => handleDeleteItem(item.id)} 
                              className="btn btn-secondary" 
                              style={{ padding: '8px', color: '#ef4444', borderColor: 'transparent' }}
                              title="Delete Item"
                              disabled={actionLoading}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* My Claim Requests Tab */}
              {activeTab === 'claims' && (
                <div className="animate-fade-in">
                  <h2 style={{ fontSize: '20px', color: 'var(--sltc-blue)', marginBottom: '20px' }}>Your Claim Claims History</h2>

                  {myClaims.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>You haven't submitted any claim requests yet.</p>
                      <Link to="/search" className="btn btn-secondary">Browse Items to Claim</Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {myClaims.map(claim => (
                        <div key={claim.id} className="claim-row animate-fade-in" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <div>
                              <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>
                                Claim for: <span style={{ color: 'var(--sltc-blue)' }}>{claim.itemTitle}</span>
                              </h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submitted on {new Date(claim.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`status-pill status-${claim.status}`}>{claim.status}</span>
                          </div>
                          
                          <div style={{ fontSize: '13px', backgroundColor: 'var(--bg-primary)', padding: '12px', borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid var(--border-color)' }}>
                            <strong>Verification Proof Provided:</strong>
                            <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>{claim.verificationProof}</p>
                          </div>

                          {claim.rejectReason && (
                            <div style={{ fontSize: '13px', backgroundColor: '#fef2f2', padding: '12px', borderRadius: 'var(--radius-md)', width: '100%', border: '1px solid #fee2e2', color: '#b91c1c' }}>
                              <strong>Rejection Reason:</strong>
                              <p style={{ marginTop: '4px' }}>{claim.rejectReason}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '20px', color: 'var(--sltc-blue)' }}>Notification Box</h2>
                    {notifications.length > 0 && (
                      <button onClick={handleClearNotifications} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', color: '#ef4444' }}>
                        Clear All
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                      <p style={{ color: 'var(--text-muted)' }}>You have no notifications.</p>
                    </div>
                  ) : (
                    <div className="notifications-panel">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`notification-card ${!notif.isRead ? 'unread' : ''}`}
                          onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                          style={{ cursor: !notif.isRead ? 'pointer' : 'default' }}
                        >
                          <div className="notification-icon" style={{ fontSize: '18px' }}>
                            {notif.type === 'match_alert' ? '🔔' : 
                             notif.type === 'claim_update' ? 'ℹ️' : '⚙️'}
                          </div>
                          <div style={{ flexGrow: 1, paddingRight: '20px' }}>
                            <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: !notif.isRead ? '600' : '400', lineHeight: '1.4' }}>
                              {notif.message}
                            </p>
                            <span className="notification-time">{new Date(notif.createdAt).toLocaleString()}</span>
                          </div>
                          {!notif.isRead && (
                            <span style={{ fontSize: '9px', fontWeight: 'bold', color: 'var(--sltc-blue)', textTransform: 'uppercase', alignSelf: 'center' }}>New</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
