import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, MapPin, Calendar, CheckCircle2, User, HelpCircle, X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Documents', 'Keys', 'Personal Accessories', 'Clothing', 'Books & Stationery', 'Others'];
const LOCATIONS = ['Library', 'Lecture Hall A', 'Lecture Hall B', 'Main Canteen', 'Gymnasium', 'Hostel Block A', 'Hostel Block B', 'Hostel Block C', 'Main Gate', 'Academic Pathway', 'Admin Office', 'Others'];

const SearchItems = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'available'); // default to showing active available items

  // Data lists
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected item modal details
  const [selectedItem, setSelectedItem] = useState(null);
  const [claimProof, setClaimProof] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (location) params.append('location', location);
      if (type) params.append('type', type);
      if (status) params.append('status', status);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        
        // If a specific ID is passed in the URL, open it automatically
        const specificId = searchParams.get('id');
        if (specificId && !selectedItem) {
          const item = data.find(i => i.id === specificId);
          if (item) setSelectedItem(item);
        }
      }
    } catch (err) {
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, category, location, type, status, searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (location) newParams.location = location;
    if (type) newParams.type = type;
    if (status) newParams.status = status;
    setSearchParams(newParams);
  };

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setClaimProof('');
    setClaimError('');
    setClaimSuccess('');
    
    // Set URL id parameter without replacing history
    setSearchParams(prev => {
      prev.set('id', item.id);
      return prev;
    });
  };

  const handleCloseItem = () => {
    setSelectedItem(null);
    setSearchParams(prev => {
      prev.delete('id');
      return prev;
    });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/search' } } });
      return;
    }
    if (!claimProof.trim()) {
      setClaimError('Verification proof details are required.');
      return;
    }

    setClaimLoading(true);
    setClaimError('');
    setClaimSuccess('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itemId: selectedItem.id,
          verificationProof: claimProof
        })
      });

      const data = await res.json();
      if (res.ok) {
        setClaimSuccess('Claim request submitted successfully! Admins will review it.');
        // Refresh items list
        fetchItems();
        // Update selected item status locally
        setSelectedItem({ ...selectedItem, status: 'claimed' });
      } else {
        setClaimError(data.message || 'Failed to submit claim.');
      }
    } catch (err) {
      console.error('Claim error:', err);
      setClaimError('Network error submitting claim.');
    } finally {
      setClaimLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--sltc-blue)' }}>Browse Lost & Found Directory</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          Search the university registry of found and lost items. Log in to claim any matched properties.
        </p>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
            
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Search Keywords</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '36px' }}
                  placeholder="e.g. key, folder, card..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Category</label>
              <select className="form-control" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <select className="form-control" value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">All Locations</option>
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Type</label>
              <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
                <option value="">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Status</label>
              <select className="form-control" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="available">Available (Unclaimed)</option>
                <option value="claimed">Claim Verification Pending</option>
                <option value="returned">Returned to Owner</option>
              </select>
            </div>

            {/* Filter Trigger Button */}
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', height: 'fit-content' }}>
              <Filter size={16} />
              <span>Filter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Items Listing Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="spinner"></div>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
          <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>No items match your query</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your tags, keyword terms, or filtering scopes.</p>
        </div>
      ) : (
        <div className="grid-cards">
          {items.map(item => (
            <div className="card" key={item.id} onClick={() => handleOpenItem(item)} style={{ cursor: 'pointer' }}>
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
                    <span className={`status-pill status-${item.status}`}>{item.status}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>By: {item.reportedByName}</span>
                <span style={{ fontSize: '12px', color: 'var(--sltc-blue)', fontWeight: '600' }}>View Details</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Item Modal Popup */}
      {selectedItem && (
        <div 
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
            backgroundColor: 'rgba(15, 45, 89, 0.4)', backdropFilter: 'blur(4px)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
          }}
          onClick={handleCloseItem}
        >
          <div 
            className="card animate-fade-in" 
            style={{ 
              width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', 
              backgroundColor: 'var(--bg-secondary)', padding: '32px', position: 'relative', 
              boxShadow: 'var(--shadow-lg)', cursor: 'default' 
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={handleCloseItem} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>

            {/* Header section of modal */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className={`status-pill status-${selectedItem.status}`}>{selectedItem.status}</span>
              <span className={`card-badge ${selectedItem.type === 'lost' ? 'badge-lost' : 'badge-found'}`} style={{ position: 'static' }}>
                {selectedItem.type}
              </span>
            </div>
            
            <h2 style={{ fontSize: '28px', color: 'var(--sltc-blue)', marginBottom: '8px' }}>{selectedItem.title}</h2>
            <span className="card-category" style={{ fontSize: '13px' }}>{selectedItem.category}</span>

            {/* Image / Icon container */}
            <div 
              style={{ 
                width: '100%', height: '240px', backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)', margin: '20px 0', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden' 
              }}
            >
              {selectedItem.photoUrl ? (
                <img src={selectedItem.photoUrl} alt={selectedItem.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '64px' }}>
                  {selectedItem.category === 'Electronics' ? '💻' :
                   selectedItem.category === 'Documents' ? '📁' :
                   selectedItem.category === 'Keys' ? '🔑' : '🎒'}
                </span>
              )}
            </div>

            {/* Details and Description */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '15px', color: 'var(--sltc-blue)', marginBottom: '6px' }}>Description</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{selectedItem.description}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0', marginBottom: '24px', fontSize: '13px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location Reported:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} />
                  {selectedItem.location}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} />
                  {selectedItem.date}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Logged By:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} />
                  {selectedItem.reportedByName}
                </span>
              </div>
            </div>

            {/* Claims section logic */}
            {selectedItem.status === 'available' && (
              <>
                {user ? (
                  selectedItem.reportedBy === user.id ? (
                    <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                      <HelpCircle size={16} />
                      <span>You reported this item. You cannot claim your own reported items.</span>
                    </div>
                  ) : (
                    <form onSubmit={handleClaimSubmit} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                      <h3 style={{ fontSize: '18px', color: 'var(--sltc-blue)', marginBottom: '12px' }}>Submit Claim Verification</h3>
                      
                      {claimError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '12px', fontSize: '12px' }}>
                          <AlertCircle size={14} />
                          <span>{claimError}</span>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" htmlFor="proof">Provide Proof of Ownership</label>
                        <textarea
                          id="proof"
                          className="form-control"
                          required
                          rows={3}
                          placeholder="Describe details only the owner would know (e.g. files/folders inside, lock screen wallpaper, specific labels, keychain shape, content list, etc.)"
                          value={claimProof}
                          onChange={e => setClaimProof(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={claimLoading}>
                        {claimLoading ? (
                          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                        ) : (
                          <span>Submit Claim Request</span>
                        )}
                      </button>
                    </form>
                  )
                ) : (
                  <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-tertiary)', padding: '20px', borderRadius: 'var(--radius-lg)' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Log in to submit a claim request for this item.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '8px 20px' }}>Log In / Sign Up</button>
                  </div>
                )}
              </>
            )}

            {selectedItem.status === 'claimed' && (
              <div style={{ backgroundColor: 'var(--status-claimed-bg)', border: '1px solid var(--status-claimed-border)', color: 'var(--status-claimed-text)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>Verification pending. An admin is currently reviewing ownership proof for this item.</span>
              </div>
            )}

            {selectedItem.status === 'returned' && (
              <div style={{ backgroundColor: 'var(--status-returned-bg)', border: '1px solid var(--status-returned-border)', color: 'var(--status-returned-text)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>Returned. This item has been successfully reclaimed by its verified owner.</span>
              </div>
            )}

            {claimSuccess && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', color: '#065f46', padding: '12px', borderRadius: 'var(--radius-md)', marginTop: '16px', fontSize: '13px' }}>
                <CheckCircle2 size={16} />
                <span>{claimSuccess}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchItems;
