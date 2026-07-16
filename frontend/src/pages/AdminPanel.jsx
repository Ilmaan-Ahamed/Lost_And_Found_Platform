import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, CheckCircle, XCircle, Info, Trash2, Calendar, MapPin, ShieldAlert, Award } from 'lucide-react';

const AdminPanel = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('claims'); // 'claims', 'items', 'stats'
  
  // Lists
  const [claims, setClaims] = useState([]);
  const [items, setItems] = useState([]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rejectReasonPrompt, setRejectReasonPrompt] = useState(null); // claimId if showing prompt
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Claims
      const claimsRes = await fetch('/api/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setClaims(claimsData);
      } else {
        throw new Error('Failed to fetch claims.');
      }

      // Fetch Items
      const itemsRes = await fetch('/api/items');
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setItems(itemsData);
      } else {
        throw new Error('Failed to fetch items.');
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Could not load administrative data. Please verify your permissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewClaim = async (claimId, status, reason = '') => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/claims/${claimId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectReason: reason })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(`Claim request successfully ${status}!`);
        setRejectReasonPrompt(null);
        setRejectReason('');
        // Refresh data
        fetchAdminData();
      } else {
        setError(data.message || 'Failed to review claim.');
      }
    } catch (err) {
      console.error('Review claim error:', err);
      setError('Network error processing review.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this item from the database?')) return;
    setActionLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccess('Item deleted successfully.');
        setItems(items.filter(i => i.id !== itemId));
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to delete item.');
      }
    } catch (err) {
      console.error('Delete item error:', err);
      setError('Network error deleting item.');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats computation
  const pendingClaims = claims.filter(c => c.status === 'pending');
  const resolvedClaims = claims.filter(c => c.status !== 'pending');
  
  const totalItems = items.length;
  const returnedItems = items.filter(i => i.status === 'returned').length;
  const availableItems = items.filter(i => i.status === 'available').length;
  const claimedItems = items.filter(i => i.status === 'claimed').length;
  
  const lostItems = items.filter(i => i.type === 'lost').length;
  const foundItems = items.filter(i => i.type === 'found').length;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: 'var(--sltc-gold-glow)', padding: '10px', borderRadius: 'var(--radius-md)', color: 'var(--sltc-gold)' }}>
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--sltc-blue)' }}>Administrative Management Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Verify pending claims, view comprehensive logs, and inspect campus registry metrics.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', color: '#065f46', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
          <CheckCircle size={16} />
          <span>{success}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="tabs-header">
        <button 
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          Pending Claim Requests ({pendingClaims.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          onClick={() => setActiveTab('items')}
        >
          All Items Registry ({items.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          System Analytics
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Claims Tab */}
          {activeTab === 'claims' && (
            <div className="animate-fade-in">
              {pendingClaims.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
                  <Award size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No Pending Claims</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>All claim requests have been reviewed and processed.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {pendingClaims.map(claim => (
                    <div key={claim.id} className="card" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <span className="card-category">Claim Request</span>
                          <h3 style={{ fontSize: '20px', color: 'var(--sltc-blue)', margin: '4px 0' }}>
                            {claim.itemTitle}
                          </h3>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Submitted by: <strong>{claim.claimedByName}</strong> on {new Date(claim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="status-pill status-claimed">Pending Review</span>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                        <h4 style={{ fontSize: '13px', color: 'var(--text-primary)', marginBottom: '6px' }}>Verification Proof Provided:</h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>"{claim.verificationProof}"</p>
                      </div>

                      {/* Action buttons */}
                      {rejectReasonPrompt === claim.id ? (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                          <div className="form-group">
                            <label className="form-label">Reason for Rejection</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="e.g. Insufficient description, serial numbers do not match..."
                              value={rejectReason}
                              onChange={e => setRejectReason(e.target.value)}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button 
                              onClick={() => handleReviewClaim(claim.id, 'rejected', rejectReason)} 
                              className="btn btn-danger"
                              disabled={actionLoading || !rejectReason.trim()}
                              style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                              Confirm Rejection
                            </button>
                            <button 
                              onClick={() => setRejectReasonPrompt(null)} 
                              className="btn btn-secondary"
                              disabled={actionLoading}
                              style={{ padding: '8px 16px', fontSize: '13px' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button 
                            onClick={() => handleReviewClaim(claim.id, 'approved')} 
                            className="btn btn-primary"
                            disabled={actionLoading}
                            style={{ padding: '8px 16px', fontSize: '13px' }}
                          >
                            <CheckCircle size={14} />
                            <span>Approve Claim</span>
                          </button>
                          
                          <button 
                            onClick={() => setRejectReasonPrompt(claim.id)} 
                            className="btn btn-secondary"
                            disabled={actionLoading}
                            style={{ padding: '8px 16px', fontSize: '13px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          >
                            <XCircle size={14} />
                            <span>Reject Claim...</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Items Registry Tab */}
          {activeTab === 'items' && (
            <div className="animate-fade-in card" style={{ padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px' }}>Category</th>
                    <th style={{ padding: '12px 8px' }}>Item Title</th>
                    <th style={{ padding: '12px 8px' }}>Type</th>
                    <th style={{ padding: '12px 8px' }}>Location</th>
                    <th style={{ padding: '12px 8px' }}>Reporter</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 8px', fontWeight: '600' }}>{item.category}</td>
                      <td style={{ padding: '12px 8px', fontWeight: '500', color: 'var(--sltc-blue)' }}>{item.title}</td>
                      <td style={{ padding: '12px 8px', textTransform: 'uppercase', fontSize: '11px', fontWeight: 'bold', color: item.type === 'lost' ? 'red' : 'green' }}>
                        {item.type}
                      </td>
                      <td style={{ padding: '12px 8px' }}>{item.location}</td>
                      <td style={{ padding: '12px 8px' }}>{item.reportedByName}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`status-pill status-${item.status}`}>{item.status}</span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteItem(item.id)} 
                          className="btn btn-secondary" 
                          style={{ padding: '6px', color: '#ef4444', borderColor: 'transparent' }}
                          title="Delete Item"
                          disabled={actionLoading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="animate-fade-in">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Total Registered Items</h4>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--sltc-blue)', display: 'block', margin: '10px 0' }}>{totalItems}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lostItems} Lost / {foundItems} Found</span>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Successfully Reclaimed</h4>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--status-available-text)', display: 'block', margin: '10px 0' }}>{returnedItems}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{((returnedItems / (totalItems || 1)) * 100).toFixed(0)}% Return rate</span>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Pending Claim Reviews</h4>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--status-claimed-text)', display: 'block', margin: '10px 0' }}>{pendingClaims.length}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{resolvedClaims.length} Claims resolved</span>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                  <h4 style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>Active Board Listings</h4>
                  <span style={{ fontSize: '36px', fontWeight: '800', color: 'var(--sltc-gold)', display: 'block', margin: '10px 0' }}>{availableItems}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Currently available on catalog</span>
                </div>
              </div>

              {/* Campus location density list */}
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--sltc-blue)', marginBottom: '16px' }}>Misplacement Density by Campus Zone</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Array.from(new Set(items.map(i => i.location))).map(loc => {
                    const locCount = items.filter(i => i.location === loc).length;
                    const percentage = (locCount / totalItems) * 100;
                    return (
                      <div key={loc}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span>{loc}</span>
                          <strong>{locCount} items ({percentage.toFixed(0)}%)</strong>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--sltc-blue)', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
