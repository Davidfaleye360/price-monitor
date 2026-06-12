'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newUrl, setNewUrl] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingProduct, setAddingProduct] = useState(false);
  const [formError, setFormError] = useState('');
  const [chartLibLoaded, setChartLibLoaded] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const router = useRouter();

  // 1. Authenticate user
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then((data) => {
        setUser(data.user);
        fetchProducts();
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  // 2. Load Chart.js from CDN dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = () => setChartLibLoaded(true);
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 3. Render Chart when selectedProduct or ChartLib changes
  useEffect(() => {
    if (!chartLibLoaded || !selectedProduct || !chartRef.current) return;

    const history = selectedProduct.priceHistory || [];
    if (history.length === 0) return;

    // Destroy previous chart instance if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    
    const labels = history.map(h => {
      try {
        const date = new Date(h.timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + 
               date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
      } catch (e) {
        return h.timestamp;
      }
    });
    
    const prices = history.map(h => h.price);

    // Create gradient strokes
    const strokeGradient = ctx.createLinearGradient(0, 0, chartRef.current.width || 400, 0);
    strokeGradient.addColorStop(0, '#3b82f6');
    strokeGradient.addColorStop(1, '#a855f7');

    const fillGradient = ctx.createLinearGradient(0, 0, 0, 200);
    fillGradient.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
    fillGradient.addColorStop(1, 'rgba(30, 41, 59, 0)');

    chartInstance.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Price ($)',
          data: prices,
          borderColor: strokeGradient,
          borderWidth: 3,
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 1.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          backgroundColor: fillGradient
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleFont: { family: 'Outfit', size: 12 },
            bodyFont: { family: 'Outfit', size: 12 },
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 10 },
              callback: value => '$' + value
            }
          },
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { family: 'Outfit', size: 9 }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [selectedProduct, chartLibLoaded]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (data.length > 0) {
          // Keep selection or default to first
          setSelectedProduct(prev => {
            const found = data.find(p => p.id === prev?.id);
            return found || data[0];
          });
        } else {
          setSelectedProduct(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');
    setAddingProduct(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, targetPrice: parseFloat(targetPrice) })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add product.');
      }

      setNewUrl('');
      setTargetPrice('');
      await fetchProducts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setAddingProduct(false);
    }
  };

  const handleDeleteProduct = async (id, e) => {
    e.stopPropagation(); // Avoid selecting deleted product
    if (!confirm('Are you sure you want to stop tracking this product?')) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (selectedProduct?.id === id) {
          setSelectedProduct(null);
        }
        await fetchProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Syncing telemetry dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '1.5rem 1rem' }}>
      <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
        
        {/* Dashboard Header */}
        <header className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', background: 'linear-gradient(to right, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Zenith Dashboard
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged in as: {user?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px' }}>
              Sign Out
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '1.5rem', flexGrow: 1 }}>
          
          {/* Left Column: Form + Products List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Add product form */}
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '1rem' }}>Track New Product</h3>
              
              {formError && (
                <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: 'var(--accent-red)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <input
                  type="url"
                  placeholder="https://www.amazon.com/dp/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Target Threshold Price ($)"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  style={{ padding: '10px 14px', fontSize: '0.85rem', borderRadius: '10px' }}
                  required
                />
                <button type="submit" disabled={addingProduct} style={{ padding: '10px 16px', fontSize: '0.85rem', borderRadius: '10px' }}>
                  {addingProduct ? 'Parsing Store DOM...' : 'Start Tracking'}
                </button>
              </form>
            </div>

            {/* Tracked items list */}
            <div className="glass-panel" style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>
                Tracked Items ({products.length})
              </h3>
              
              <div style={{ overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingRight: '4px', maxHeight: '500px' }}>
                {products.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '2rem' }}>
                    You are not tracking any products yet.
                  </p>
                ) : (
                  products.map((p) => {
                    const isSelected = selectedProduct?.id === p.id;
                    const isAlert = p.currentPrice > 0 && p.currentPrice <= p.targetPrice;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedProduct(p)}
                        className={`glass-panel ${isSelected ? 'glass-panel-hover' : ''}`}
                        style={{
                          padding: '1rem',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(168, 85, 247, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                          borderColor: isSelected ? 'var(--accent-purple)' : 'var(--card-border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          position: 'relative'
                        }}
                      >
                        {/* Thumbnail */}
                        <div style={{
                          width: '50px',
                          height: '50px',
                          background: 'white',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ fontSize: '1.2rem' }}>📦</span>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: '600', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                            {p.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Target: ${p.targetPrice.toFixed(2)}</span>
                            <span style={{ fontWeight: '600', color: isAlert ? 'var(--accent-green)' : 'var(--accent-blue)' }}>
                              Current: {p.currentPrice > 0 ? `$${p.currentPrice.toFixed(2)}` : 'Scraping...'}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <button
                          onClick={(e) => handleDeleteProduct(p.id, e)}
                          className="btn-secondary"
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            flexShrink: 0
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Chart + Details */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {selectedProduct ? (
              <>
                {/* Product details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {selectedProduct.title}
                    </h3>
                    <a href={selectedProduct.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', textDecoration: 'underline', marginTop: '4px', display: 'inline-block' }}>
                      Open Original Product Link ↗
                    </a>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'inline-flex',
                      padding: '4px 12px',
                      borderRadius: '100px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: selectedProduct.currentPrice > 0 && selectedProduct.currentPrice <= selectedProduct.targetPrice ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: selectedProduct.currentPrice > 0 && selectedProduct.currentPrice <= selectedProduct.targetPrice ? 'var(--accent-green)' : 'var(--accent-blue)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      {selectedProduct.currentPrice > 0 && selectedProduct.currentPrice <= selectedProduct.targetPrice ? '🎯 TARGET HIT' : '🔄 MONITORING'}
                    </div>
                  </div>
                </div>

                {/* Dashboard Metrics Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Value</span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px' }}>
                      {selectedProduct.currentPrice > 0 ? `$${selectedProduct.currentPrice.toFixed(2)}` : 'Scraping...'}
                    </h4>
                  </div>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Target Boundary</span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px', color: 'var(--accent-purple)' }}>
                      ${selectedProduct.targetPrice.toFixed(2)}
                    </h4>
                  </div>
                  <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(255,255,255,0.01)', borderRadius: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Checks Logged</span>
                    <h4 style={{ fontSize: '1.6rem', fontWeight: '700', marginTop: '4px' }}>
                      {selectedProduct.priceHistory?.length || 0}
                    </h4>
                  </div>
                </div>

                {/* Chart Visualization */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>Price Telemetry History</h4>
                  <div style={{ flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                    {!chartLibLoaded ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '4rem' }}>Loading chart engine...</p>
                    ) : selectedProduct.priceHistory?.length <= 1 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '16px' }}>
                        <span>📈</span>
                        <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Waiting for additional checks to plot trends.</p>
                      </div>
                    ) : (
                      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', border: '1px dashed var(--card-border)', borderRadius: '24px', padding: '4rem 0' }}>
                <span style={{ fontSize: '2.5rem' }}>📊</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>No Product Selected</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '300px', textAlign: 'center' }}>
                  Select an item from your tracking list on the left to review price graphs and metadata logs.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
