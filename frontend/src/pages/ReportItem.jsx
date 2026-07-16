import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, AlertCircle, CheckCircle, Info } from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Personal Accessories',
  'Clothing',
  'Books & Stationery',
  'Others'
];

const LOCATIONS = [
  'Library',
  'Lecture Hall A',
  'Lecture Hall B',
  'Main Canteen',
  'Gymnasium',
  'Hostel Block A',
  'Hostel Block B',
  'Hostel Block C',
  'Main Gate',
  'Academic Pathway',
  'Admin Office',
  'Others'
];

const ReportItem = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form fields
  const [type, setType] = useState('found'); // 'lost' or 'found'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [photo, setPhoto] = useState(null);
  
  // Preview
  const [photoPreview, setPhotoPreview] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('location', location);
    formData.append('date', date);
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Note: Multer multipart/form-data doesn't need Content-Type header
        },
        body: formData
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setSuccess('Item reported successfully! Redirecting to Dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px', maxWidth: '640px' }}>
      <div className="card" style={{ padding: '32px', boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--sltc-blue)', marginBottom: '8px' }}>Report Lost or Found Item</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Enter the details below to log a misplaced object onto the campus database board.
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#b91c1c', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#ecfdf5', border: '1px solid #d1fae5', color: '#065f46', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13px' }}>
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Toggle Type */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Report Type</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                className={`btn ${type === 'found' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setType('found')}
                style={{ flex: 1, padding: '12px' }}
              >
                🎒 I Found Something
              </button>
              <button
                type="button"
                className={`btn ${type === 'lost' ? 'btn-danger' : 'btn-secondary'}`}
                onClick={() => setType('lost')}
                style={{ flex: 1, padding: '12px', color: type === 'lost' ? '#fff' : 'var(--text-primary)' }}
              >
                🔍 I Lost Something
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
              <Info size={12} />
              <span>
                {type === 'found' 
                  ? 'Use this if you picked up an item and want to find its owner.' 
                  : 'Use this if you misplaced an item and hope someone turns it in.'}
              </span>
            </div>
          </div>

          {/* Item Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Item Title / Name</label>
            <input
              type="text"
              id="title"
              className="form-control"
              required
              placeholder="e.g. Dell Laptop Charger, Keys with Red Chain, ID Card"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Detailed Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              required
              placeholder="Provide specific details (e.g., color, brand, stickers, unique scratches, contents of folders) to help verify ownership."
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Categories and Location grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Estimated Location</label>
              <select
                id="location"
                className="form-control"
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                {LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Picker */}
          <div className="form-group">
            <label className="form-label" htmlFor="date">Date Found / Lost</label>
            <input
              type="date"
              id="date"
              className="form-control"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Photo Upload */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Upload Photo (Optional)</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '6px' }}>
              <div 
                style={{ 
                  flexGrow: 1, border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', 
                  padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', 
                  justifyContent: 'center', position: 'relative', cursor: 'pointer' 
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <Upload size={24} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {photo ? photo.name : 'Select or drag an image'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>PNG, JPG up to 5MB</span>
              </div>
              
              {photoPreview && (
                <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            {loading ? (
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
            ) : (
              <span>Submit Report</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportItem;
